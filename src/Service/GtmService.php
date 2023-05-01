<?php

namespace Google\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class GtmService
{
    private $id;

    private bool $enable;

    /**
     * construct
     */
    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->enable = $parameterBag->get("google.tag_manager.enable");
        $this->id = $parameterBag->get("google.tag_manager.id");
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function isEnabled()
    {
        return $this->enable;
    }
}
