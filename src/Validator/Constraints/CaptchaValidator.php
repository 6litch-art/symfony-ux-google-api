<?php

namespace Google\Validator\Constraints;

use Google\Service\GrService;
use ReCaptcha\ReCaptcha;
use ReCaptcha\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

final class CaptchaValidator extends ConstraintValidator
{
    private $responses = [];

    public function __construct(GrService $google.recaptcha.rvice)
    {
        $this->google.recaptcha.rvice = $google.recaptcha.rvice;
    }

    public function validate($value, Constraint $constraint): void
    {
        if (!$constraint instanceof Captcha)
            throw new UnexpectedTypeException($constraint, Captcha::class);

        if ($value !== null && !is_scalar($value) && !(\is_object($value) && method_exists($value, '__toString')))
            throw new UnexpectedTypeException($value, 'string');

        $value = explode(" ", $value)[0] ?? "";
        if( $constraint->getVersion() == GrService::APIV3) {

            $value = null !== $value ? (string) $value : '';
            if ($value === '') {
                $this->context->buildViolation($constraint->messageMissingValue)->addViolation();
                return;
            }
        }

        $request = Request::createFromGlobals();
        $reCaptcha = new ReCaptcha($this->google.recaptcha.rvice->getSecret($constraint->getVersion()));


        $response = $reCaptcha->verify($value, $request->getClientIp());
        $this->responses[] = $response;

        $scoreThreshold = $this->google.recaptcha.rvice->getScoreThreshold();
        if (!$response->isSuccess() || ($response->getScore() && $response->getScore() < $scoreThreshold)) {

            if(!$response->getErrorCodes())
                $this->context->buildViolation($constraint->message)->addViolation();

            foreach($response->getErrorCodes() as $error)
                $this->context->buildViolation("captcha.error.".str_replace("-", "_", $error))->addViolation();
        }
    }

    public function getResponses(): array
    {
        return $this->responses;
    }
}