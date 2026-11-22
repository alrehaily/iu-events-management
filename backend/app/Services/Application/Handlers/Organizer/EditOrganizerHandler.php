<?php

namespace HiEvents\Services\Application\Handlers\Organizer;

use HiEvents\DomainObjects\ImageDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\Status\OrganizerStatus;
use HiEvents\Repository\Interfaces\AccountRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Organizer\DTO\EditOrganizerDTO;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Database\DatabaseManager;
use Throwable;

class EditOrganizerHandler
{
    public function __construct(
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly AccountRepositoryInterface $accountRepository,
        private readonly DatabaseManager $databaseManager,
        private readonly HtmlPurifierService $htmlPurifierService,
    ) {}

    /**
     * @throws Throwable
     */
    public function handle(EditOrganizerDTO $organizerData): OrganizerDomainObject
    {
        return $this->databaseManager->transaction(
            fn () => $this->editOrganizer($organizerData)
        );
    }

    private function editOrganizer(EditOrganizerDTO $organizerData): OrganizerDomainObject
    {
        $this->organizerRepository->updateWhere(
            attributes: [
                'name' => $organizerData->name,
                'email' => $organizerData->email,
                'phone' => $organizerData->phone,
                'website' => $organizerData->website,
                'description' => $this->htmlPurifierService->purify($organizerData->description),
                'account_id' => $organizerData->account_id,
                'timezone' => $organizerData->timezone,
                'currency' => $organizerData->currency,
            ],
            where: [
                'id' => $organizerData->id,
                'account_id' => $organizerData->account_id,
            ]
        );

        if ($this->accountRepository->findById($organizerData->account_id)?->getAccountVerifiedAt() !== null) {
            $this->organizerRepository->updateWhere(
                attributes: ['status' => OrganizerStatus::LIVE->name],
                where: [
                    'id' => $organizerData->id,
                    'account_id' => $organizerData->account_id,
                    'status' => OrganizerStatus::DRAFT->name,
                ],
            );
        }

        return $this->organizerRepository
            ->loadRelation(ImageDomainObject::class)
            ->findFirstWhere([
                'id' => $organizerData->id,
                'account_id' => $organizerData->account_id,
            ]);
    }
}
