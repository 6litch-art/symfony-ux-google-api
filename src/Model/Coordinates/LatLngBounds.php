<?php

namespace Google\Model\Coordinates;

/*

A LatLngBounds instance represents a rectangle in geogoogle.recaptcha.hical coordinates,
including one that crosses the 180 degoogle.recaptcha.s longitudinal meridian.

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLngBounds

*/

/**
 *
 */
class LatLngBounds
{
    protected LatLng $sw;

    public function getSouthWest(): LatLng
    {
        return $this->sw;
    }

    protected LatLng $ne;

    public function getNorthEast(): LatLng
    {
        return $this->ne;
    }

    public function __construct(LatLng $sw, LatLng $ne)
    {
        $this->sw = $sw;
        $this->ne = $ne;
    }

    /**
     * @param LatLng $that
     * @return bool
     */
    public function equals(LatLng $that)
    {
        return $this == $that;
    }

    // public function contains(LatLng $latLng)
    // public function extends(Point $point);

    /**
     * @return string
     */
    public function __toString()
    {
        return 'new google.maps.LatLngBounds(' . $this->getSouthWest() . ', ' . $this->getNorthEast() . ')';
    }

    /**
     * @return false|string
     */
    public function toJSON()
    {
        return json_encode(['sw' => $this->getSouthWest()->toJSON(), 'ne' => $this->getNorthEast()->toJSON()]);
    }

    /**
     * @param $precision
     * @return string
     */
    public function toUrlValue($precision = 6): string
    {
        return 'sw=' . $this->getSouthWest()->toUrlValue($precision) .
            '&ne=' . $this->getNorthEast()->toUrlValue($precision);
    }
}
