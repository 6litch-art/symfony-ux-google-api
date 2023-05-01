<?php

namespace Google\Model\Coordinates;

/*

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#Size

*/

/**
 *
 */
class Size
{
    private float $width;

    /**
     * @return float
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @param $width
     * @return void
     */
    public function setWidth($width)
    {
        $this->width = $width;
    }

    private float $height;

    /**
     * @return float
     */
    public function getHeight()
    {
        return $this->height;
    }

    /**
     * @param $height
     * @return void
     */
    public function setHeight($height)
    {
        $this->height = $height;
    }

    private string $widthUnit;

    /**
     * @return bool
     */
    public function hasWidthUnit()
    {
        return !empty($this->widthUnit);
    }

    /**
     * @return string
     */
    public function getWidthUnit()
    {
        return $this->widthUnit;
    }

    /**
     * @param $widthUnit
     * @return void
     */
    public function setWidthUnit($widthUnit)
    {
        $this->widthUnit = $widthUnit;
    }

    private string $heightUnit;

    /**
     * @return bool
     */
    public function hasHeightUnit()
    {
        return !empty($this->heightUnit);
    }

    /**
     * @return string
     */
    public function getHeightUnit()
    {
        return $this->heightUnit;
    }

    /**
     * @param $heightUnit
     * @return void
     */
    public function setHeightUnit($heightUnit)
    {
        $this->heightUnit = $heightUnit;
    }

    public function __construct(float $width = 1.0, float $height = 1.0, string $widthUnit = '', string $heightUnit = '')
    {
        $this->setWidth($width);
        $this->setHeight($height);
        $this->setWidthUnit($widthUnit);
        $this->setHeightUnit($heightUnit);
    }

    /**
     * @param LatLng $that
     * @return bool
     */
    public function equals(LatLng $that)
    {
        return $this == $that;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return 'new google.maps.Size(' .
            $this->width . ', ' . $this->height .
            ($this->hasWidthUnit() ? ', ' . $this->widthUnit : '') .
            ($this->hasHeightUnit() ? ', ' . $this->heightUnit : '') .
            ')';
    }

    /**
     * @return string
     */
    public function toUrlValue()
    {
        return $this->width . 'x' . $this->height;
    }
}
