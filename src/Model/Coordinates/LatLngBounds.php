<?php

namespace Google\Model\Coordinates;

/*

A LatLngBounds instance represents a rectangle in geogoogle.recaptcha.hical coordinates,
including one that crosses the 180 degoogle.recaptcha.s longitudinal meridian.

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLngBounds

*/

class LatLngBounds
{
    /**
     * @var LatLng
     */
    protected LatLng $sw;

    public function getSouthWest(): LatLng
    {
        return $this->sw;
    }

    /**
     * @var LatLng
     */
    protected LatLng $ne;

    public function getNorthEast(): LatLng
    {
        return $this->ne;
    }

    /**
     * @param LatLng $sw
     * @param LatLng $ne
     */
    public function __construct(LatLng $sw, LatLng $ne)
    {
        $this->sw = $sw;
        $this->ne = $ne;
    }

    public function equals(LatLng $that)
    {
        return ($this == $that);
    }

    //public function contains(LatLng $latLng)
    //public function extends(Point $point);

    public function __toString()
    {
        return "new google.maps.LatLngBounds(" . $this->getSouthWest() . ", " . $this->getNorthEast() . ")";
    }

    public function toJSON()
    {
        return json_encode(["sw" => $this->getSouthWest()->toJSON(), "ne" => $this->getNorthEast()->toJSON()]);
    }

    public function toUrlValue($precision = 6): string
    {
        return "sw=" . $this->getSouthWest()->toUrlValue($precision) .
            "&ne=" . $this->getNorthEast()->toUrlValue($precision);
    }
}
