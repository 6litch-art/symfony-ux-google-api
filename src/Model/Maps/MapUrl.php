<?php

namespace Google\Model\Maps;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class MapUrl extends GmClient
{
    /**
     * @param $opts
     * @param HttpClientInterface|null $client
     */
    public function __construct($opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setKey(1);
    }

    /**
     * @return array|mixed|string
     */
    public function Search()
    {
        return $this->send('https://www.google.com/maps/search');
    }

    /**
     * @return array|mixed|string
     */
    public function Directions()
    {
        return $this->send('https://www.google.com/maps/dir');
    }

    /**
     * @return array|mixed|string
     */
    public function DisplayMap()
    {
        $this->addOption('map_action', 'map');
        $content = $this->send('https://www.google.com/maps/@');

        $this->pop('map_action');

        return $content;
    }

    /**
     * @return array|mixed|string
     */
    public function DisplayStreetView()
    {
        $this->addOption('map_action', 'pano');
        $content = $this->send('https://www.google.com/maps/@');

        $this->pop('map_action');

        return $content;
    }
}
