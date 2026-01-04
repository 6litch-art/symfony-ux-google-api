<?php

namespace Google\Validator\Constraints;

use Google\Service\GrService;
use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */

#[\Attribute]
final class Captcha extends Constraint
{
    public string $message = 'captcha.test.failed';
    public string $messageMissingValue = 'captcha.test.missing_value';

    public string $api;

    public function __construct(
        string $api,
        ?string $message = null,
        ?string $messageMissingValue = null,
        array $groups = null,
        mixed $payload = null,
    ) {
        parent::__construct([], $groups, $payload);

        $this->api = match ($api) {
            GrService::APIV2,
            GrService::APIV3 => $api,
            default => throw new \InvalidArgumentException('Invalid API version provided.'),
        };

        if ($message !== null) {
            $this->message = $message;
        }

        if ($messageMissingValue !== null) {
            $this->messageMissingValue = $messageMissingValue;
        }
    }
}