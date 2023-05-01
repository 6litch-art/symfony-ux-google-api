<?php

namespace Google\Model\Maps;

use Google\Builder\GmObject;
use Symfony\Component\Config\Definition\Exception\Exception;

use Google\Model\Maps\Overlay\Marker;
use Google\Model\Coordinates\LatLng;
use Google\Model\Maps\Overlay\MapTypeStyle;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class Map extends GmObject
{
    public function __construct(array $opts = [])
    {
        parent::__construct($opts);

        $this->addListener("tilesloaded", "function(){ window.dispatchEvent(new Event('tilesloaded')); }");
        $this->addListener("idle", "function(){ window.dispatchEvent(new Event('idle')); }");
        $this->addListener("drag", "function(){ window.dispatchEvent(new Event('drag')); }");
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

    public function setDefaultUI(bool $b = true)
    {
        $this->addOption("disableDefaultUI", (!$b ? "true" : "false"));
        return $this;
    }

    public function setMapID(string $id)
    {
        return $this->addOption("mapId", "'" . $id . "'");
    }

    public function getMapID(): ?string
    {
        return $this->getOption("mapId");
    }

    public function addMarker($gmBuilder, $opts = []): self
    {
        if (!$this->getId()) {
            throw new Exception("Map not yet added to builder.. cannot add marker");
        }

        $marker = ($opts instanceof Marker ? $opts : new Marker($opts));
        $marker->addOption("map", $this->getId());
        $marker->setParent($this);

        $gmBuilder->addMarker("marker_" . md5(uniqid(rand(), true)), $marker);
        return $this;
    }

    public function addMapStyle($gmBuilder, $name, $featureTypes = [])
    {
        if (!$this->getId()) {
            throw new Exception("Map not yet added to builder.. cannot add a map type style");
        }

        $mapStyle = ($name instanceof MapTypeStyle ? $name : new MapTypeStyle($name, $featureTypes));
        if (array_key_exists($mapStyle->getName(), $this->mapStyleList)) {
            return $this;
        }

        $id = $this->getId();
        $mapStyleId = "mapTypeStyle_" . md5(uniqid(rand(), true));

        $gmBuilder->addMapStyle($mapStyleId, $mapStyle);
        $this->addEntry($id . ".mapTypes.set(" . $mapStyle->getName() . ", " . $mapStyleId . ");");

        $this->mapStyleList[$mapStyle->getName()] = $mapStyle;
        return $this;
    }

    protected array $mapStyleList = [];

    public function getMapStyleList()
    {
        return $this->mapStyleList;
    }

    public function setMapStyle($mapStyle, array $zStopList = [])
    {
        if (!$this->getId()) {
            throw new Exception("Map not yet added to builder.. cannot add a map type style");
        }

        if ($this->getMapId()) {
            throw new Exception("Custom Map ID already set.. This might conflict with MapTypeStyle");
        }

        if (!array_key_exists($mapStyle->getName(), $this->mapStyleList)) {
            throw new Exception("MapTypeStyle " . $mapStyle->getName() . " is not in the list of the mapTypes for \"" . $this->getId() . "\"");
        }

        // No zStop position then just set the display style
        if (empty($zStopList)) {
            $this->addEntry($this->getId() . ".setMapTypeId(" . $mapStyle->getName() . ");");
            return $this;
        }

        // In case of zStop, just set style depending on the zoom value
        // e.g. z < zStop => "mapStyle[zStop]"
        $zStopFunction = "function() { ";

        $i = 0;
        $N = count($zStopList);
        foreach ($zStopList as $zStop => $mapStyle2) {
            $zStop = intval($zStop);
            if (!$mapStyle2 instanceof MapTypeStyle) {
                throw new Exception("MapTypeStyle " . $mapStyle2->getName() . " is not an instance of MapTypeStyle for \"" . $this->getId() . "\"");
            }

            if ($i++ > 0) {
                $zStopFunction .= " else ";
            }

            $condition = $this->getId() . ".getZoom() < " . $zStop;
            $setMapTypeId = $this->getId() . ".setMapTypeId(" . $mapStyle2->getName() . "); " . PHP_EOL;
            $zStopFunction .= "if (" . $condition . ") " . $setMapTypeId;
        }

        $zStopFunction .=
            "else " . $this->getId() . ".setMapTypeId(" . $mapStyle->getName() . ");" . PHP_EOL;

        $zStopFunction .= "}";

        $this->addListener("idle", $zStopFunction);
        $this->addListener("zoom_changed", $zStopFunction);

        return $this;
    }
}
