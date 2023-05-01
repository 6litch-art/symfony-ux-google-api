<?php

namespace Google\Model\Maps\Overlay;

use Google\Builder\GmObject;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class Marker extends GmObject
{
    public function __toString(): string
    {
        return 'new google.maps.Marker('.$this->getOpts(self::JsonEncoding).')';
    }
}
