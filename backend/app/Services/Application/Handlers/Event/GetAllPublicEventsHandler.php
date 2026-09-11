<?php

namespace HiEvents\Services\Application\Handlers\Event;

use HiEvents\DomainObjects\EventLocationDomainObject;
use HiEvents\DomainObjects\EventOccurrenceDomainObject;
use HiEvents\DomainObjects\EventSettingDomainObject;
use HiEvents\DomainObjects\ImageDomainObject;
use HiEvents\DomainObjects\LocationDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\ProductCategoryDomainObject;
use HiEvents\DomainObjects\ProductDomainObject;
use HiEvents\DomainObjects\ProductPriceDomainObject;
use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\DomainObjects\TaxAndFeesDomainObject;
use HiEvents\Repository\Eloquent\Value\OrderAndDirection;
use HiEvents\Repository\Eloquent\Value\Relationship;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\Event\DTO\GetAllPublicEventsDTO;
use Illuminate\Pagination\LengthAwarePaginator;

class GetAllPublicEventsHandler
{
    public function __construct(
        private readonly EventRepositoryInterface $eventRepository,
    ) {}

    public function handle(GetAllPublicEventsDTO $dto): LengthAwarePaginator
    {
        $query = $this->eventRepository
            ->loadRelation(new Relationship(domainObject: EventLocationDomainObject::class, nested: [
                new Relationship(domainObject: LocationDomainObject::class, name: 'location'),
            ], name: 'event_location'))
            ->loadRelation(new Relationship(domainObject: EventOccurrenceDomainObject::class, nested: [
                new Relationship(domainObject: EventLocationDomainObject::class, nested: [
                    new Relationship(domainObject: LocationDomainObject::class, name: 'location'),
                ], name: 'event_location'),
            ]))
            ->loadRelation(
                new Relationship(ProductCategoryDomainObject::class, [
                    new Relationship(ProductDomainObject::class,
                        nested: [
                            new Relationship(ProductPriceDomainObject::class),
                            new Relationship(TaxAndFeesDomainObject::class),
                        ],
                        orderAndDirections: [
                            new OrderAndDirection('order', 'asc'),
                        ]
                    ),
                ])
            )
            ->loadRelation(new Relationship(EventSettingDomainObject::class))
            ->loadRelation(new Relationship(ImageDomainObject::class))
            ->loadRelation(new Relationship(domainObject: OrganizerDomainObject::class, name: 'organizer'));

        return $query->findEvents(
            where: [
                'status' => EventStatus::LIVE->name,
            ],
            params: $dto->queryParams
        );
    }
}
