<?php

namespace Google\Model\Places;

use Google\Builder\GmClient;
use Google\Builder\GmBuilder;
use Google\Builder\RenderingInterface;

use Google\Model\Coordinates\LatLng;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Config\Definition\Exception\Exception;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class Autocomplete extends GmClient
{
    public function __construct(?string $input, $opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setKey($this->pop("key") ?? GmBuilder::getInstance()->key);
    }
}
