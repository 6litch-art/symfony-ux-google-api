<?php

namespace Google\Exception;

use Symfony\Component\Security\Core\Exception\AuthenticationException;

/**
 *
 */
class InvalidCaptchaException extends AuthenticationException
{
    /**
     * {@inheritdoc}
     */
    public function getMessageKey()
    {
        return $this->getMessage();
    }
}
