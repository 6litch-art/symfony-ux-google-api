<?php

namespace Google\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

/**
 *
 */
class GtmService
{
    private $id;

    private bool $enable;

    /**
     * construct.
     */
    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->enable = $parameterBag->get('google.tag_manager.enable');
        $this->id = $parameterBag->get('google.tag_manager.id');
    }

    /**
     * @return array|bool|float|int|string|\UnitEnum|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param $id
     * @return void
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return array|bool|float|int|string|\UnitEnum|null
     */
    public function isEnabled()
    {
        return $this->enable;
    }
}
