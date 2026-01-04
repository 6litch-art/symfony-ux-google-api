<?php

namespace Google\Validator\Constraints;

use Google\Service\GrService;
use ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

final class CaptchaValidator extends ConstraintValidator
{
    private array $responses = [];

    public function __construct(
        private readonly GrService $grService,
        private readonly RequestStack $requestStack,
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof Captcha) {
            throw new UnexpectedTypeException($constraint, Captcha::class);
        }

        if ($value === null || $value === '') {
            if ($constraint->api === GrService::APIV3) {
                $this->context
                    ->buildViolation($constraint->messageMissingValue)
                    ->addViolation();
            }

            return;
        }

        if (!is_scalar($value) && !(\is_object($value) && method_exists($value, '__toString'))) {
            throw new UnexpectedTypeException($value, 'string');
        }

        $token = explode(' ', (string) $value, 2)[0];

        $request = $this->requestStack->getCurrentRequest();
        $ip = $request?->getClientIp();

        $reCaptcha = new ReCaptcha(
            $this->grService->getSecret($constraint->api)
        );

        $response = $reCaptcha->verify($token, $ip);
        $this->responses[] = $response;

        $scoreThreshold = $this->grService->getScoreThreshold();

        if (
            !$response->isSuccess()
            || ($response->getScore() !== null && $response->getScore() < $scoreThreshold)
        ) {
            $errors = $response->getErrorCodes();

            if (!$errors) {
                $this->context
                    ->buildViolation($constraint->message)
                    ->addViolation();
                return;
            }

            foreach ($errors as $error) {
                $this->context
                    ->buildViolation('captcha.error.' . str_replace('-', '_', $error))
                    ->addViolation();
            }
        }
    }

    public function getResponses(): array
    {
        return $this->responses;
    }
}