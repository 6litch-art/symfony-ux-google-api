<?php

namespace Google\Model\Maps;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;
use Google\Model\Coordinates\LatLng;
use Google\Model\Coordinates\Size;
use Symfony\Component\Config\Definition\Exception\Exception;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class MapStatic extends GmClient
{
    /**
     * @param int|null $width0
     * @param int|null $height0
     * @param $opts
     * @param HttpClientInterface|null $client
     */
    public function __construct(?int $width0, ?int $height0, $opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setBaseUrl('https://maps.googleapis.com/maps/api/staticmap');

        $size = $this->pop('size');

        $width = 0;
        $height = 0;

        if ($size instanceof Size) {
            $width = $size->getWidth();
            $width = $size->getHeight();
        } elseif (is_string($size)) {
            $size = explode('x', $size);
            $width = $size[0] ?? null;
            $height = $size[1] ?? null;
        } else {
            $width = $this->pop('width');
            $height = $this->pop('height');
        }

        $width = $width0 ?? $width;
        $height = $height0 ?? $height;
        if (null == $width || null == $height) {
            throw new Exception('Unknown dimension size');
        }

        $this->addOption('size', new Size((float)$width, (float)$height));
    }

    /**
     * @param int $value
     * @return $this
     */
    /**
     * @param int $value
     * @return $this
     */
    public function setZoom(int $value)
    {
        $this->addOption('zoom', $value);

        return $this;
    }

    /**
     * @param LatLng $center
     * @return $this
     */
    /**
     * @param LatLng $center
     * @return $this
     */
    public function setCenter(LatLng $center)
    {
        $this->addOption('center', $center);

        return $this;
    }

    /**
     * @return string|null
     */
    public function getSize()
    {
        return $this->getOption('size');
    }

    /**
     * @param $width
     * @param int|null $height
     * @return $this
     */
    /**
     * @param $width
     * @param int|null $height
     * @return $this
     */
    public function setSize($width, int $height = null)
    {
        $sizde = null;
        if ($width instanceof Size) {
            $size = $width;
        }
        if (!$size && null == $height || $size && null != $height) {
            throw new Exception('Ambiguious size provided');
        }

        if (!$size) {
            $size = new Size($width, $height);
        }
        $this->addOption('size', $size);

        return $this;
    }

    /**
     * @return null
     */
    public function getWidth()
    {
        return $this->getOption('size') ? $this->getOption('size')->getWidth() : null;
    }

    /**
     * @return null
     */
    public function getHeight()
    {
        return $this->getOption('size') ? $this->getOption('size')->getHeight() : null;
    }
}
