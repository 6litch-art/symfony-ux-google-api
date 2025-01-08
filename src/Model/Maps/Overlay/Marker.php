<?php

namespace Google\Model\Maps\Overlay;

use Google\Builder\GmObject;

/**
 * @author Marco Meyer <marco.meyerconde@gmail.com>
 */
class Marker extends GmObject
{
    public function getAssets(): \Generator
    {
        $classname = explode('\\', get_class($this));
        $classname = $classname[count($classname) - 1];
        yield "const { ".$classname." } = await google.maps.importLibrary('map');";
    }
}
