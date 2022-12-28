<?php

namespace Google\Subscriber;

use Twig\Environment;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class GrListener
{
    /** @var bool */
    protected ?bool $enable;
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

    public function __construct(RequestStack $requestStack, ParameterBagInterface $parameterBag, Environment $twig)
    {
        $this->twig         = $twig;
        $this->parameterBag = $parameterBag;
        $this->requestStack = $requestStack;
    }

    public function isEasyAdmin()
    {
        $request = $this->requestStack->getCurrentRequest();
        if($request == null) return false;

        $controllerAttr = $request->attributes->get("_controller") ?? "";
        $array = is_array($controllerAttr) ? $controllerAttr : explode("::", $controllerAttr);
        $controller = explode("::", $array[0])[0];

        $parents = [];
        $parent = $controller;

        while(class_exists($parent) && ( $parent = get_parent_class($parent)))
            $parents[] = $parent;

        $eaParents = array_filter($parents, fn($c) => str_starts_with($c, "EasyCorp\Bundle\EasyAdminBundle"));
        return !empty($eaParents);
    }

    public function isProfiler($event)
    {
        $route = $event->getRequest()->get('_route') ?? "";
        return str_starts_with($route, "_wdt") || str_starts_with($route, "_profiler");
    }

    private function allowRender(ResponseEvent $event)
    {
        if (!$event->isMainRequest())
                return false;

        if (!$this->enable)
                return false;

        if (!$this->autoAppend)
                return false;

        if($this->isEasyAdmin() && !$this->enableOnAdmin)
                return false;

        $contentType = $event->getResponse()->headers->get('content-type');
        if ($contentType && !str_contains($contentType, "text/html"))
                return false;

        return !$this->isProfiler($event);
    }

    public function onKernelResponse(ResponseEvent $event)
    {
        $this->enable = $this->parameterBag->get("google.recaptcha.enable");
        $this->enableOnAdmin = $this->parameterBag->get("google.recaptcha.enable_on_admin");
        $this->autoAppend = $this->parameterBag->get("google.recaptcha.autoappend");

        if (!$this->allowRender($event)) return false;

        $response = $event->getResponse();
        $javascripts = $this->twig->getGlobals()["google_recaptcha"]["javascripts"] ?? "";
        $stylesheets = $this->twig->getGlobals()["google_recaptcha"]["stylesheets"] ?? "";

        $content = preg_replace([
            '/<\/head\b[^>]*>/',
            '/<\/head\b[^>]*>/',
        ], [
            $javascripts. "$0",
            $stylesheets."$0",

        ], $response->getContent(), 1);

        if(!is_instanceof($response, [StreamedResponse::class, BinaryFileResponse::class]))
            $response->setContent($content);

        return true;
    }
}
