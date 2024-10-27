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
        yield "await google.maps.importLibrary('maps')";
    }
}
