<?php

namespace HiEvents\DomainObjects;

class EventSettingDomainObject extends Generated\EventSettingDomainObjectAbstract
{
    public const array HOMEPAGE_CONTENT_FIELDS = [
        'target_audience',
        'certificate_info',
        'requirements_info',
        'event_highlights',
        'attendee_notice',
    ];

    public function getHomepageContent(): array
    {
        $content = $this->getHomepageThemeSettings()['content'] ?? [];

        return is_array($content) ? array_intersect_key($content, array_flip(self::HOMEPAGE_CONTENT_FIELDS)) : [];
    }

    /**
     * @todo This should not be here.
     */
    public function getGetEmailFooterHtml(): string
    {
        if ($this->getEmailFooterMessage() === null) {
            return '';
        }

        return <<<HTML
<div style="color: #888; margin-top: 30px; margin-bottom: 30px; font-size: .9em;">
    {$this->getEmailFooterMessage()}
</div>
HTML;
    }
}
