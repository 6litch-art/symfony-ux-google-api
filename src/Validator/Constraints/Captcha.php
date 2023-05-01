<?php

namespace Google\Validator\Constraints;

use Google\Service\GrService;
use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
final class Captcha extends Constraint
{
    public string $message = 'captcha.test.failed';
    public string $messageMissingValue = 'captcha.test.missing_value';

    protected mixed $api;

    /**
     * @return mixed
     */
    public function getVersion()
    {
        return $this->api;
    }

    /**
     * @param array|null $options
     * @param string|null $message
     * @param array|null $groups
     * @param $payload
     * @throws \Exception
     */
    public function __construct(array $options = null, string $message = null, array $groups = null, $payload = null)
    {
        parent::__construct($options ?? [], $groups, $payload);

        $api = $options['api'];
        $this->api = match ($api) {
            GrService::APIV2, GrService::APIV3 => $api,
            default => throw new \Exception('Invalid API version provided.'),
        };
    }
}
