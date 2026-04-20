<?php

namespace Google\Model\Places;

use Google\Builder\GmObject;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class PlacesService extends GmObject
{
    public function __construct(array $opts = [])
    {
        parent::__construct($opts);
    }

    public function __toString(): string
    {
        return 'new google.maps.places.PlacesService('.$this->getOpts(self::JsonEncoding).')';
    }
}
