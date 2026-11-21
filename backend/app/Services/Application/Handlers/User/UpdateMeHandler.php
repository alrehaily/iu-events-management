<?php

namespace HiEvents\Services\Application\Handlers\User;

use HiEvents\DomainObjects\UserDomainObject;
use HiEvents\Exceptions\PasswordInvalidException;
use HiEvents\Mail\User\ConfirmEmailChangeMail;
use HiEvents\Repository\Interfaces\UserRepositoryInterface;
use HiEvents\Services\Application\Handlers\User\DTO\UpdateMeDTO;
use HiEvents\Services\Infrastructure\Encryption\EncryptedPayloadService;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Contracts\Mail\Mailer;

readonly class UpdateMeHandler
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private Hasher $hasher,
        private Mailer $mailer,
        private EncryptedPayloadService $encryptedPayloadService,
    ) {}

    /**
     * @throws PasswordInvalidException
     */
    public function handle(UpdateMeDTO $updateUserData): UserDomainObject
    {
        $existingUser = $this->getExistingUser($updateUserData);
        $updateArray = [];

        if ($this->isChangingPassword($updateUserData)) {
            $this->validateCurrentPassword($updateUserData, $existingUser);
            $updateArray['password'] = $this->hasher->make($updateUserData->password);
        }

        $updateArray += array_filter([
            'first_name' => $updateUserData->first_name,
            'last_name' => $updateUserData->last_name,
            'timezone' => $updateUserData->timezone,
            'locale' => $updateUserData->locale,
        ], static fn (?string $value) => $value !== null);

        $email = $updateUserData->email === null ? null : strtolower($updateUserData->email);
        $emailChanged = $email !== null && $email !== $existingUser->getEmail();
        if ($emailChanged) {
            $updateArray['pending_email'] = $email;
        }

        if ($updateUserData->marketing_opt_in !== null) {
            $updateArray['marketing_opted_in_at'] = $updateUserData->marketing_opt_in
                ? now()->toDateTimeString()
                : null;
        }

        $this->userRepository->updateWhere(
            attributes: $updateArray,
            where: [
                'id' => $updateUserData->id,
            ]
        );

        if ($emailChanged) {
            $this->sendEmailChangeConfirmation($existingUser);
        }

        return $this->userRepository->findByIdAndAccountId($updateUserData->id, $updateUserData->account_id);
    }

    private function isChangingPassword(UpdateMeDTO $updateUserData): bool
    {
        return $updateUserData->password !== null && $updateUserData->current_password !== null;
    }

    /**
     * @throws PasswordInvalidException
     */
    private function validateCurrentPassword(UpdateMeDTO $updateUserData, UserDomainObject $existingUser): void
    {
        if (! $this->hasher->check($updateUserData->current_password, $existingUser->getPassword())) {
            throw new PasswordInvalidException('Current password is invalid');
        }
    }

    private function getExistingUser(UpdateMeDTO $updateUserData): UserDomainObject
    {
        return $this->userRepository->findByIdAndAccountId(
            $updateUserData->id,
            $updateUserData->account_id
        );
    }

    private function sendEmailChangeConfirmation(UserDomainObject $existingUser): void
    {
        $this->mailer
            ->to($existingUser->getEmail())
            ->locale($existingUser->getLocale())
            ->send(new ConfirmEmailChangeMail($existingUser, $this->encryptedPayloadService->encryptPayload([
                'id' => $existingUser->getId(),
            ]))
            );
    }
}
