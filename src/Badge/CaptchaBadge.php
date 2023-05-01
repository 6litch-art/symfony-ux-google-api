<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Google\Badge;

use Symfony\Component\Security\Http\Authenticator\Passport\Badge\BadgeInterface;

/**
 *
 */
class CaptchaBadge implements BadgeInterface
{
    private bool $resolved = false;
    private string $fieldId;
    private ?string $value;

    /**
     * @param string $fieldId An arbitrary string used to generate the value of the CSRF token.
     *                             Using a different string for each authenticator improves its security.
     * @param string|null $captcha The CSRF token presented in the request, if any
     */
    public function __construct(string $fieldId, ?string $value)
    {
        $this->fieldId = $fieldId;
        $this->value = $value;
    }

    public function getFieldId(): string
    {
        return $this->fieldId;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    /**
     * @internal
     */
    public function markResolved(): void
    {
        $this->resolved = true;
    }

    public function isResolved(): bool
    {
        return $this->resolved;
    }
}
