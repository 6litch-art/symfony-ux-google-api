<?php

namespace Google\Model\Maps;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;

use Google\Model\Coordinates\LatLng;
use Google\Model\Coordinates\Size;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Config\Definition\Exception\Exception;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 *
 */
class MapStatic extends GmClient
{
    public function __construct(?int $width0, ?int $height0, $opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setBaseUrl("https://maps.googleapis.com/maps/api/staticmap");

        $size = $this->pop("size");
        if($size instanceof Size) {

            $width = $size->getWidth();
            $width = $size->getHeight();

        } else if(is_string($size)) {

            $size = explode("x", $size);
            $width = $size[0] ?? null;
            $height = $size[1] ?? null;

        } else {

            $width  = $this->pop("width");
            $height = $this->pop("height");
        }

        $width  = $width0  ?? $width;
        $height = $height0 ?? $height;
        if($width == null || $height == null)
            throw new Exception("Unknown dimension size");

        $this->addOption("size", new Size((float) $width, (float) $height));
    }

    public function setZoom(int $value)
    {
        $this->addOption("zoom", $value);
        return $this;
    }

    public function setCenter(LatLng $center)
    {
        $this->addOption("center", $center);
        return $this;
    }

    public function getSize()
    {
        return $this->getOption("size");
    }

    public function setSize($width, int $height = null)
    {
        if ($width instanceof Size) $size = $width;
        if (!$size && $height == null || $size && $height != null)
            throw new Exception("Ambiguious size provided");

        if (!$size) $size = new Size($width, $height);
        $this->addOption("size", $size);

        return $this;
    }

    public function getWidth()
    {
        return ($this->getOption("size") ? $this->getOption("size")->getWidth() : null);
    }
    public function getHeight()
    {
        return ($this->getOption("size") ? $this->getOption("size")->getHeight() : null);
    }
}
