<?php

namespace Google\Tag\Manager\Service;
use Base\Service\BaseService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

use Symfony\Component\HttpKernel\KernelInterface;

class GtmService
{
    /**
     * @var string
     */
    private $id;

    /**
     * @var boolean
     */
    private $enable;

    /**
     * construct
     */
    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->enable = $parameterBag->get("gtm.enable");
        $this->id     = $parameterBag->get("gtm.id");
    }

    public function getId() { return $this->id; }
    public function setId($id) { $this->id = $id; }

    public function isEnabled() { return $this->enable; }
}
