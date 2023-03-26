<?php

namespace Google\Model\Coordinates;

/*

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#Point

*/

class Point
{
    /**
     * @var float
     */
    private $x;
    public function getX()
    {
        return $this->x;
    }
    public function setX($x)
    {
        $this->x = $x;
    }

    /**
     * @var float
     */
    private $y;
    public function getY()
    {
        return $this->y;
    }
    public function setY($y)
    {
        $this->y = $y;
    }

    /**
     * @param float $x
     * @param float $y
     */
    public function __construct($x = 0.0, $y = 0.0)
    {
        $this->setX($x);
        $this->setY($y);
    }

    public function equals(LatLng $that)
    {
        return ($this == $that);
    }

    public function __toString(): string
    {
        return "new google.maps.Size(" .$this->x . ", " . $this->y .")";
    }
}
