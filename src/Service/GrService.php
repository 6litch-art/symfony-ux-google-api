<?php

namespace Google\Service;

use Exception;
use Google\Form\Type\ReCaptchaV2Type;
use Google\Form\Type\ReCaptchaV3Type;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\SubmitButton;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Twig\Environment;
use Twig\Loader\ChainLoader;

class GrService
{
    const CACHE_DURATION = 24*3600;
    const APIV2 = "apiv2";
    const APIV3 = "apiv3";

    const SEPARATOR = "_";

    protected $enable;
    protected $bag;
    
    protected $baseService = null;

    /**
     * @var CacheInterface
     */
    protected $cache = null;

    public function __construct(KernelInterface $kernel, Environment $twig, RequestStack $requestStack, CacheInterface $cache)
    {
        $this->container    = $kernel->getContainer();
        $this->cache        = $cache;
        $this->request      = $requestStack->getCurrentRequest();
        
        $this->enable       = $this->container->getParameter("google.recaptcha.enable");
        $this->onLoadMethod = $this->container->getParameter("google.recaptcha.onload");

        $this->twig    = $twig;
        if($this->getLoader()) {
            $this->getLoader()->prependPath($kernel->getProjectDir()."/vendor/glitchr/google-api/templates/form");
            $this->getLoader()->prependPath($kernel->getProjectDir()."/vendor/symfony/twig-bridge/Resources/views", "Twig");
        }
    }

    public function getLoader()
    {
        $loader = $this->twig->getLoader();
        if($loader instanceof ChainLoader)
            $loader = $loader->getLoaders()[0] ?? null;

        return $loader;
    }

    public function getAsset(string $url): string
    {
        $url = trim($url);
        $parseUrl = parse_url($url);
        if($parseUrl["scheme"] ?? false)
            return $url;

        $path = $parseUrl["path"];
        if(!str_starts_with($path, "/"))
            $path = $this->request->getBasePath()."/".$path;

        return $path;
    }

    public static function getType(string $api)
    {
        switch($api) {

            case self::APIV2:
                return ReCaptchaV2Type::class;
            case self::APIV3:
                return ReCaptchaV3Type::class;

            default:
                throw new Exception("Invalid API version provided.");
        }
    }

    public function initJs()
    {
        if(!$this->enable) return;

        $javascripts  = "<script src='".$this->getAsset("bundles/google.recaptcha.js")."' defer></script>" . PHP_EOL;
        $javascripts .= "<script src='https://www.google.com/recaptcha/api.js?onload=".$this->onLoadMethod."&render=explicit'></script>";
        $this->twig->addGlobal("google.recaptcha", array_merge(
            $this->twig->getGlobals()["google_recaptcha"] ?? [],
            ["javascripts" => ($this->twig->getGlobals()["google.recaptcha"]["javascripts"] ?? "") . $javascripts]
        ));
    }

    public function isEnabled() { return $this->enable; }
    public function getSecret(string $api)
    {
        switch($api) {

            case self::APIV2:
            case self::APIV3:
                return $this->container->getParameter("google.recaptcha.api.secret");

            default:
                throw new Exception("Invalid API version provided.");
        }
    }

    public function getFailedAttempts(string $formName): int
    {
        $normalizedIp = str_replace(":", ".", $this->request->getClientIp());
        $key = $formName.self::SEPARATOR."failedAttempts".self::SEPARATOR.$normalizedIp;
        $cacheItem = $this->cache->getItem($key);

        if(!$cacheItem->isHit()) $failedAttempts = 0;
        else $failedAttempts = $cacheItem->get() ?? 0;

        return $failedAttempts;
    }

    public function resetFailedAttempt(string $formName)
    {
        $normalizedIp = str_replace(":", ".", $this->request->getClientIp());
        $key = $formName.self::SEPARATOR."failedAttempts".self::SEPARATOR.$normalizedIp;
        $this->cache->delete($key);

        return $this;
    }

    public function addFailedAttempt(string $formName, int $expiresAfter = self::CACHE_DURATION)
    {
        $normalizedIp = str_replace(":", ".", $this->request->getClientIp());
        $key = $formName.self::SEPARATOR."failedAttempts".self::SEPARATOR.$normalizedIp;
        $cacheItem = $this->cache->getItem($key);

        if(!$cacheItem->isHit()) $failedAttempts = 0;
        else $failedAttempts = $cacheItem->get() ?? 0;

        $cacheItem->set(++$failedAttempts);
        $cacheItem->expiresAfter($expiresAfter);
        $this->cache->save($cacheItem);

        return $this;
    }

    public function hasTriggeredMinimumAttempts(FormInterface $form, array $options)
    {
        return $this->getFailedAttempts($form->getName()) >= $this->getMinimumAttempts($options['captcha_api']);
    }

    public function getMinimumAttempts() { return $this->container->getParameter("google.recaptcha.".self::APIV2.".min_attempts")    ?? 0; }
    public function getScoreThreshold()  { return $this->container->getParameter("google.recaptcha.".self::APIV3.".score_threshold") ?? 0; }

    public function getSiteKey(string $api)
    {
        switch($api) {

            case self::APIV2:
            case self::APIV3:
                return $this->container->getParameter("google.recaptcha.api.sitekey");

            default:
                throw new Exception("Invalid API version provided.");
        }
    }

    public function findSubmitButton(FormInterface $form): ?SubmitButton {

        foreach($form->getIterator() as $child) {

            if($child instanceof SubmitButton) return $child;
        }

        return null;
    }

    public function findCaptchaType(FormInterface $form){

        foreach($form->getIterator() as $child) {

            $innerType = $child->getConfig()->getType()->getInnerType();
            if($innerType instanceof ReCaptchaV2Type) return $child;
            if($innerType instanceof ReCaptchaV3Type) return $child;
        }

        return null;
    }
}