<?php

namespace Google\Model\Maps;

use Google\Builder\GmObject;
use Google\Model\Coordinates\LatLng;
use Google\Model\Maps\Overlay\StyledMapType;
use Google\Model\Maps\Overlay\Marker;
use Symfony\Component\Config\Definition\Exception\Exception;

/**
 * @author Marco Meyer <marco.meyerconde@gmail.com>
 */
class Map extends GmObject
{
    public function __construct(array $options = [])
    {
        parent::__construct($options);

        $this->addListener('tilesloaded', "function(){ window.dispatchEvent(new Event('tilesloaded')); }");
        $this->addListener('idle', "function(){ window.dispatchEvent(new Event('idle')); }");
        $this->addListener('drag', "function(){ window.dispatchEvent(new Event('drag')); }");
    }

    public function getAssets(): \Generator
    {
        yield "await google.maps.importLibrary('maps')";
    }

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
    public function setCenter(LatLng $center)
    {
        $this->addOption('center', $center);

        return $this;
    }

    /**
     * @param bool $b
     * @return $this
     */
    public function setDefaultUI(bool $b = true)
    {
        $this->addOption('disableDefaultUI', !$b ? 'true' : 'false');

        return $this;
    }

    /**
     * @param string $id
     * @return Map
     */
    public function setMapID(string $id)
    {
        return $this->addOption('mapId', "'" . $id . "'");
    }

    public function getMapID(): ?string
    {
        return $this->getOption('mapId');
    }

    /**
     * @param $gmBuilder
     * @param $options
     * @return $this
     */
    public function addMarker($gmBuilder, $options = []): self
    {
        if (!$this->getId()) {
            throw new Exception('Map not yet added to builder.. cannot add marker');
        }

        $marker = ($options instanceof Marker ? $options : new Marker($options));
        $marker->addOption('map', $this->getId());
        $marker->setParent($this);

        $gmBuilder->addMarker('marker_' . md5(uniqid(rand(), true)), $marker);

        return $this;
    }

    /**
     * @param $gmBuilder
     * @param $name
     * @param $featureTypes
     * @return $this
     */
    public function addMapStyle($gmBuilder, $name, $featureTypes = [])
    {
        if (!$this->getId()) {
            throw new Exception('Map not yet added to builder.. cannot add a map type style');
        }

        $mapStyle = ($name instanceof StyledMapType ? $name : new StyledMapType($name, $featureTypes));
        if (array_key_exists($mapStyle->getName(), $this->mapStyleList)) {
            return $this;
        }

        $id = $this->getId();
        $mapStyleId = 'mapTypeStyle_' . md5(uniqid(rand(), true));

        $gmBuilder->addMapStyle($mapStyleId, $mapStyle);
        $this->addEntry($id . '.mapTypes.set(' . $mapStyle->getName() . ', ' . $mapStyleId . ');');

        $this->mapStyleList[$mapStyle->getName()] = $mapStyle;

        return $this;
    }

    protected array $mapStyleList = [];

    /**
     * @return array
     */
    public function getMapStyleList()
    {
        return $this->mapStyleList;
    }

    /**
     * @param $mapStyle
     * @param array $zStopList
     * @return $this
     */
    public function setMapStyle($mapStyle, array $zStopList = [])
    {
        if (!$this->getId()) {
            throw new Exception('Map not yet added to builder.. cannot add a map type style');
        }

        if ($this->getMapId()) {
            throw new Exception('Custom Map ID already set.. This might conflict with StyledMapType');
        }

        if (!array_key_exists($mapStyle->getName(), $this->mapStyleList)) {
            throw new Exception('StyledMapType ' . $mapStyle->getName() . ' is not in the list of the mapTypes for "' . $this->getId() . '"');
        }

        // No zStop position then just set the display style
        if (empty($zStopList)) {
            $this->addEntry($this->getId() . '.setMapTypeId(' . $mapStyle->getName() . ');');

            return $this;
        }

        // In case of zStop, just set style depending on the zoom value
        // e.g. z < zStop => "mapStyle[zStop]"
        $zStopFunction = 'function() { ';

        $i = 0;
        $N = count($zStopList);
        foreach ($zStopList as $zStop => $mapStyle2) {
            $zStop = intval($zStop);
            if (!$mapStyle2 instanceof StyledMapType) {
                throw new Exception('StyledMapType ' . $mapStyle2->getName() . ' is not an instance of StyledMapType for "' . $this->getId() . '"');
            }

            if ($i++ > 0) {
                $zStopFunction .= ' else ';
            }

            $condition = $this->getId() . '.getZoom() < ' . $zStop;
            $setMapTypeId = $this->getId() . '.setMapTypeId(' . $mapStyle2->getName() . '); ' . PHP_EOL;
            $zStopFunction .= 'if (' . $condition . ') ' . $setMapTypeId;
        }

        $zStopFunction .=
            'else ' . $this->getId() . '.setMapTypeId(' . $mapStyle->getName() . ');' . PHP_EOL;

        $zStopFunction .= '}';

        $this->addListener('idle', $zStopFunction);
        $this->addListener('zoom_changed', $zStopFunction);

        return $this;
    }
}
