<?php

namespace Google\Service;

use Base\Service\ParameterBagInterface;
use Google\Form\Type\ReCaptchaV2Type;
use Google\Form\Type\ReCaptchaV3Type;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\SubmitButton;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Twig\Environment;
use Twig\Loader\ChainLoader;
use Twig\Loader\LoaderInterface;

/**
 *
 */
class GrService
{
    public const CACHE_DURATION = 24 * 3600;
    public const APIV2 = 'apiv2';
    public const APIV3 = 'apiv3';

    public const SEPARATOR = '_';

    protected bool $enable;

    protected Request $request;

    protected Environment $twig;

    protected CacheInterface $cache;

    protected ContainerInterface $container;

    /** * @var string */
    protected string $onLoadMethod;

    protected ParameterBagInterface $parameterBag;

    public function __construct(KernelInterface $kernel, Environment $twig, ParameterBagInterface $parameterBag, RequestStack $requestStack, CacheInterface $cache)
    {
        $this->parameterBag = $parameterBag;
        $this->container = $kernel->getContainer();
        $this->cache = $cache;
        $this->request = $requestStack->getCurrentRequest();

        $this->enable = $this->parameterBag->get('google.recaptcha.enable');
        $this->onLoadMethod = $this->parameterBag->get('google.recaptcha.onload');

        $this->twig = $twig;
        if ($this->getLoader()) {
            $this->getLoader()->prependPath($kernel->getProjectDir() . '/vendor/glitchr/ux-google/templates/form');
            $this->getLoader()->prependPath($kernel->getProjectDir() . '/vendor/symfony/twig-bridge/Resources/views', 'Twig');
        }
    }

    /**
     * @return mixed|LoaderInterface|null
     */
    public function getLoader()
    {
        $loader = $this->twig->getLoader();
        if ($loader instanceof ChainLoader) {
            $loader = $loader->getLoaders()[0] ?? null;
        }

        return $loader;
    }

    public function getAsset(string $url): string
    {
        $url = trim($url);
        $parseUrl = parse_url($url);
        if ($parseUrl['scheme'] ?? false) {
            return $url;
        }

        $path = $parseUrl['path'];
        if (!str_starts_with($path, '/')) {
            $path = $this->request->getBasePath() . '/' . $path;
        }

        return $path;
    }

    /**
     * @param string $api
     * @return string
     * @throws \Exception
     */
    public static function getType(string $api)
    {
        return match ($api) {
            self::APIV2 => ReCaptchaV2Type::class,
            self::APIV3 => ReCaptchaV3Type::class,
            default => throw new \Exception('Invalid API version provided.'),
        };
    }

    public function initJs()
    {
        if (!$this->enable) {
            return;
        }

        if (!empty($this->twig->getGlobals()['google_recaptcha'] ?? null)) {
            return;
        }

        $javascripts = "<script src='" . $this->getAsset('bundles/google/recaptcha.js') . "'></script>" . PHP_EOL;
        $javascripts .= "<script src='https://www.google.com/recaptcha/api.js?onload=" . $this->onLoadMethod . "&render=explicit'></script>";

        try {
            $this->twig->addGlobal('google_recaptcha', array_merge(
                $this->twig->getGlobals()['google_recaptcha'] ?? [],
                ['javascripts' => ($this->twig->getGlobals()['google_recaptcha']['javascripts'] ?? '') . $javascripts]
            ));
        } catch (\LogicException $e) {
        }
    }

    /**
     * @return array|bool|float|int|string|\UnitEnum|null
     */
    public function isEnabled()
    {
        $this->enable = $this->parameterBag->get('google.recaptcha.enable');
        return $this->enable;
    }

    /**
     * @param string $api
     * @return array|bool|float|int|string|\UnitEnum|null
     * @throws \Exception
     */
    public function getSecret(string $api)
    {
        return match ($api) {
            self::APIV2, self::APIV3 => $this->parameterBag->get('google.recaptcha.' . $api . '.secret'),
            default => throw new \Exception('Invalid API version provided.'),
        };
    }

    public function getFailedAttempts(string $formName): int
    {
        $normalizedIp = str_replace(':', '.', $this->request->getClientIp());
        $key = $formName . self::SEPARATOR . 'failedAttempts' . self::SEPARATOR . $normalizedIp;
        $cacheItem = $this->cache->getItem($key);

        if (!$cacheItem->isHit()) {
            $failedAttempts = 0;
        } else {
            $failedAttempts = $cacheItem->get() ?? 0;
        }

        return $failedAttempts;
    }

    /**
     * @param string $formName
     * @return $this
     * @throws \Psr\Cache\InvalidArgumentException
     */
    /**
     * @param string $formName
     * @return $this
     * @throws \Psr\Cache\InvalidArgumentException
     */
    public function resetFailedAttempt(string $formName)
    {
        $normalizedIp = str_replace(':', '.', $this->request->getClientIp());
        $key = $formName . self::SEPARATOR . 'failedAttempts' . self::SEPARATOR . $normalizedIp;
        $this->cache->delete($key);

        return $this;
    }

    /**
     * @param string $formName
     * @param int $expiresAfter
     * @return $this
     */
    /**
     * @param string $formName
     * @param int $expiresAfter
     * @return $this
     */
    public function addFailedAttempt(string $formName, int $expiresAfter = self::CACHE_DURATION)
    {
        $normalizedIp = str_replace(':', '.', $this->request->getClientIp());
        $key = $formName . self::SEPARATOR . 'failedAttempts' . self::SEPARATOR . $normalizedIp;
        $cacheItem = $this->cache->getItem($key);

        if (!$cacheItem->isHit()) {
            $failedAttempts = 0;
        } else {
            $failedAttempts = $cacheItem->get() ?? 0;
        }

        $cacheItem->set(++$failedAttempts);
        $cacheItem->expiresAfter($expiresAfter);
        $this->cache->save($cacheItem);

        return $this;
    }

    /**
     * @param FormInterface $form
     * @param array $options
     * @return bool
     */
    public function hasTriggeredMinimumAttempts(FormInterface $form, array $options)
    {
        return $this->getFailedAttempts($form->getName()) >= $this->getMinimumAttempts($options);
    }

    /**
     * @param array $options
     * @return int|mixed
     */
    public function getMinimumAttempts(array $options = [])
    {
        return $options['captcha_min_attempts'] ?? 0;
    }

    /**
     * @param array $options
     * @return int|mixed
     */
    public function getScoreThreshold(array $options = [])
    {
        return $options['captcha_score_threshold'] ?? 0.5;
    }

    /**
     * @param string $api
     * @return array|bool|float|int|string|\UnitEnum|null
     * @throws \Exception
     */
    public function getSiteKey(string $api)
    {
        return match ($api) {
            self::APIV2, self::APIV3 => $this->parameterBag->get('google.recaptcha.' . $api . '.sitekey'),
            default => throw new \Exception('Invalid API version provided.'),
        };
    }

    /**
     * @param FormInterface $form
     * @return SubmitButton|null
     */
    public function findSubmitButton(FormInterface $form)
    {
        $submitButton = null;
        foreach ($form->all() as $child) {
            if ($child instanceof SubmitButton) {
                $submitButton = $child;
                break;
            }
        }

        return $submitButton;
    }

    /**
     * @param FormInterface $form
     * @return mixed|null
     */
    public function findCaptchaType(FormInterface $form)
    {
        foreach ($form->getIterator() as $child) {
            $innerType = $child->getConfig()->getType()->getInnerType();
            if ($innerType instanceof ReCaptchaV2Type) {
                return $child;
            }
            if ($innerType instanceof ReCaptchaV3Type) {
                return $child;
            }
        }

        return null;
    }
}
