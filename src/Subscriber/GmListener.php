<?php

namespace Google\Subscriber;

use Twig\Environment;
use Google\Builder\GmBuilder;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class GmListener
{
    private $twig;

    public function __construct(ParameterBagInterface $parameterBag, Environment $twig, RequestStack $requestStack)
    {
        $this->twig       = $twig;
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
        $route = $event->getRequest()->get('_route');
        return str_starts_with($route, "_wdt") || str_starts_with($route, "_profiler");
    }

    private function allowRender(ResponseEvent $event)
    {
        if (!$this->enable)
            return false;

        $builder = GmBuilder::getInstance();
        if (!$builder)
            return false;
            
        if (!$builder->isEnabled())
            return false;

        if (!$this->autoAppend)
            return false;
            
        if($this->isEasyAdmin() && !$this->enableOnAdmin)
            return false;

        $contentType = $event->getResponse()->headers->get('content-type');
        if ($contentType && !str_contains($contentType, "text/html"))
            return false;

        if (!$event->isMainRequest())
            return false;

        return !$this->isProfiler($event);
    }

    public function onKernelResponse(ResponseEvent $event)
    {
        $this->enable = $this->parameterBag->get("google.maps.enable");
        $this->enableOnAdmin = $this->parameterBag->get("google.maps.enable_on_admin");
        $this->autoAppend = $this->parameterBag->get("google.maps.autoappend");

        if (!$this->allowRender($event)) return false;

        $response    = $event->getResponse();
        $api         = $this->twig->getGlobals()["google_maps"]["api"] ?? "";
        $html2canvas = $this->twig->getGlobals()["google_maps"]["html2canvas"] ?? "";
        $initMap     = $this->twig->getGlobals()["google_maps"]["initMap"] ?? "";

        $content = preg_replace([
            '/<\/body\b[^>]*>/',
            '/<\/head\b[^>]*>/',
            '/<\/head\b[^>]*>/'
        ], [
            $api."$0",
            $html2canvas."$0",
            $initMap."$0",
            
        ], $response->getContent(), 1);
        $response->setContent($content);

        return true;
    }
}
