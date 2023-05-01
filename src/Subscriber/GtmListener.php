<?php

namespace Google\Subscriber;

use Twig\Environment;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

/**
 *
 */
class GtmListener
{
    /** @var bool */
    protected bool $enable = false;
    /** @var bool */
    protected bool $enableOnAdmin;
    /** @var bool */
    protected bool $autoAppend;
    /** @var string|null */
    protected ?string $containerId;
    /** @var string|null */
    protected ?string $serverUrl;

    /**
     * @var Environment
     */
    protected Environment $twig;

    /**
     * @var ParameterBagInterface
     */
    protected ParameterBagInterface $parameterBag;

    /**
     * @var RequestStack
     */
    protected RequestStack $requestStack;

    public function __construct(RequestStack $requestStack, ParameterBagInterface $parameterBag, Environment $twig)
    {
        $this->twig = $twig;
        $this->parameterBag = $parameterBag;
        $this->requestStack = $requestStack;
    }

    /**
     * @param $event
     * @return bool
     */
    public function isProfiler($event)
    {
        $route = $event->getRequest()->get('_route') ?? "";
        return str_starts_with($route, "_wdt") || str_starts_with($route, "_profiler");
    }

    /**
     * @return bool
     */
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

        $eaParents = array_filter($parents, fn($c) => str_starts_with($c, "EasyCorp\Bundle\EasyAdminBundle"));
        return !empty($eaParents);
    }

    /**
     * @param ResponseEvent $event
     * @return bool
     */
    private function allowRender(ResponseEvent $event)
    {
        if (!$event->isMainRequest()) {
            return false;
        }

        if (!$this->enable) {
            return false;
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

        $this->enable = $this->parameterBag->get("google.tag_manager.enable");
        $this->enableOnAdmin = $this->parameterBag->get("google.tag_manager.enable_on_admin");
        if (!$this->enable) {
            return;
        }

        $this->autoAppend = $this->parameterBag->get("google.tag_manager.autoappend");
        foreach ($this->parameterBag->get("google.tag_manager.containers") ?? [] as $container) {
            $this->containerId = $container["id"] ?? null;
            if (!$this->containerId) {
                continue;
            }

            $this->serverUrl = $container["url"] ?? null;

            $noscripts =
                "<noscript>
                    <iframe src='" . $this->serverUrl . "/ns.html?id=" . $this->containerId . "' height='0' width='0' style='display:none;visibility:hidden'></iframe>
                </noscript>";

            $javascripts =
                "<script>
                    (function (w, d, s, l, i) {
                        w[l] = w[l] || [];
                        w[l].push({
                            'gtm.start': new Date().getTime(),
                            event: 'gtm.js'
                        });
                        var f = d.getElementsByTagName(s)[0],
                            j = d.createElement(s),
                            dl = l != 'dataLayer' ? '&l=' + l : '';
                        j.async = true;
                        j.src =
                            '" . $this->serverUrl . "/gtm.js?id=' + i + dl;
                        f.parentNode.insertBefore(j, f);
                    })(window, document, 'script', 'dataLayer', '" . $this->containerId . "');
                </script>";

            $this->twig->addGlobal("google_tag_manager", array_merge(
                $this->twig->getGlobals()["google_tag_manager"] ?? [],
                [
                    "javascripts" => ($this->twig->getGlobals()["google_tag_manager"]["javascripts"] ?? "") . $javascripts,
                    "noscripts" => ($this->twig->getGlobals()["google_tag_manager"]["noscripts"] ?? "") . $noscripts
                ]
            ));
        }
    }

    /**
     * @param ResponseEvent $event
     * @return bool
     * @throws \Exception
     */
    public function onKernelResponse(ResponseEvent $event)
    {
        if (!$this->allowRender($event)) {
            return false;
        }

        $response = $event->getResponse();
        $javascripts = $this->twig->getGlobals()["google_tag_manager"]["javascripts"] ?? "";
        $noscripts = $this->twig->getGlobals()["google_tag_manager"]["noscripts"] ?? "";

        $content = preg_replace([
            '/<\/head\b[^>]*>/',
            '/<body\b[^>]*>/',
        ], [
            $javascripts . "$0",
            "$0" . $noscripts,
        ], $response->getContent(), 1);

        if (!is_instanceof($response, [StreamedResponse::class, BinaryFileResponse::class])) {
            $response->setContent($content);
        }

        return true;
    }
}
