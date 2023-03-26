<?php

namespace Google\Validator\Constraints;

use Exception;
use Google\Service\GrService;
use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
final class Captcha extends Constraint
{
    public $message = 'captcha.test.failed';
    public $messageMissingValue = 'captcha.test.missing_value';

    protected $api;

    public function getVersion()
    {
        return $this->api;
    }
    public function __construct(array $options = null, string $message = null, array $groups = null, $payload = null)
    {
        parent::__construct($options ?? [], $groups, $payload);

        $api = $options["api"];
        switch($api) {
            case GrService::APIV2:
            case GrService::APIV3:
                $this->api = $api;
                break;

            default:
                throw new Exception("Invalid API version provided.");
        }
    }
}
