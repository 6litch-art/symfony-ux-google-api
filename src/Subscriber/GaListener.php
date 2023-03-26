<?php

namespace Google\Subscriber;

use Twig\Environment;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class GaListener
{
    /** @var bool */
    protected ?bool $enable = false;
    /** @var bool */
    protected ?bool $enableOnAdmin;
    /** @var bool */
    protected ?bool $autoAppend;

    /**
     * @var Environment
     */
    protected $twig;

    /**
     * @var ParameterBagInterface
     */
    protected $parameterBag;

    /**
     * @var RequestStack
     */
    protected $requestStack;

    /** @var string */
    private $viewId;

    public function __construct(RequestStack $requestStack, ParameterBagInterface $parameterBag, Environment $twig)
    {
        $this->twig = $twig;
        $this->parameterBag = $parameterBag;
        $this->requestStack = $requestStack;
    }

    public function isProfiler($event)
    {
        $route = $event->getRequest()->get('_route');
        return str_starts_with($route ?? "", "_wdt") || str_starts_with($route ?? "", "_profiler");
    }

    public function isEasyAdmin()
    {
        $request = $this->requestStack->getCurrentRequest();
        if ($request == null) {
            return false;
        }

        $controllerAttr = $request->attributes->get("_controller") ?? "";
        $array = is_array($controllerAttr) ? $controllerAttr : explode("::", $controllerAttr);
        $controller = explode("::", $array[0])[0];

        $parents = [];
        $parent = $controller;

        while (class_exists($parent) && ($parent = get_parent_class($parent))) {
            $parents[] = $parent;
        }

        $eaParents = array_filter($parents, fn ($c) => str_starts_with($c, "EasyCorp\Bundle\EasyAdminBundle"));
        return !empty($eaParents);
    }

    private function allowRender(ResponseEvent $event)
    {
        if (!$event->isMainRequest()) {
            return false;
        }

        if (!$this->enable) {
            return false;
        }

        if (!$this->viewId) {
            return;
        }

        if (!$this->autoAppend) {
            return false;
        }

        if ($this->isEasyAdmin() && !$this->enableOnAdmin) {
            return false;
        }

        $contentType = $event->getResponse()->headers->get('content-type');
        if ($contentType && !str_contains($contentType, "text/html")) {
            return false;
        }

        return !$this->isProfiler($event);
    }

    public function onKernelRequest(RequestEvent $event)
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $this->enable     = $this->parameterBag->get("ga.enable");
        $this->enableOnAdmin = $this->parameterBag->get("google.recaptcha.nable_on_admin");
        if (!$this->enable) {
            return false;
        }

        $this->viewId     = $this->parameterBag->get("ga.view_id");
        if (!$this->viewId) {
            return;
        }

        $this->serverUrl     = $this->parameterBag->get("ga.server_url");
        if (!$this->serverUrl) {
            return;
        }

        $this->autoAppend = $this->parameterBag->get("ga.autoappend");
        $javascripts = "<script src='".$this->serverUrl."/gtag/js?id=" . $this->viewId . "' async></script>".
                       "<script><!-- Global site tag (gtag.js) - Google Analytics -->" . PHP_EOL .
                       "    window.dataLayer = window.dataLayer || [];" . PHP_EOL .
                       "    function gtag() { dataLayer.push(arguments); }" . PHP_EOL .
                       "    gtag('js', new Date());" . PHP_EOL .
                       "    gtag('config', '".$this->viewId."');</script>";

        // Adding user-defined assets
        $this->twig->addGlobal("google_analytics", array_merge(
            $this->twig->getGlobals()["google_analytics"] ?? [],
            ["javascripts" => ($this->twig->getGlobals()["google_analytics"]["javascripts"] ?? "") . $javascripts]
        ));
    }

    public function onKernelResponse(ResponseEvent $event)
    {
        if (!$this->allowRender($event)) {
            return false;
        }

        $response = $event->getResponse();
        $javascript = $this->twig->getGlobals()["google_analytics"]["javascripts"] ?? "";

        $content = preg_replace(['/<\/head\b[^>]*>/'], [$javascript."$0"], $response->getContent(), 1);

        if (!is_instanceof($response, [StreamedResponse::class, BinaryFileResponse::class])) {
            $response->setContent($content);
        }

        return true;
    }
}
