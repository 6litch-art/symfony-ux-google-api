<?php

namespace Google\Builder;

/**
 *
 */
class GmEvent extends GmObject implements GmEventInterface
{
    protected string $action;

    protected string $event;

    protected string $callback;

    public function __construct(GmObjectInterface $parent, string $event, string $callback)
    {
        parent::__construct();
        $this->setParent($parent);

        $this->event = $event;
        $this->callback = $callback;
        $this->action = 'addListener';
    }

    /**
     * @return string
     */
    public function getEvent()
    {
        return $this->event;
    }

    /**
     * @return string
     */
    public function getCallback()
    {
        return $this->callback;
    }

    public function setOnce()
    {
        $this->action = 'addListenerOnce';
    }

    public function __toString(): string
    {
        $commentTag = '';
        $callback = $this->callback;
        $parentCacheExists = $this->parentCacheExists();

        if (GmBuilder::getInstance()->cacheOnly) {
            $isGranted = GmBuilder::getInstance()->isGranted();
            if ($this->parentCacheEnabled() && (!$isGranted || $parentCacheExists)) {
                return '';
            }
        }

        if ($parentCacheExists) {
            if ('dev' == GmBuilder::getInstance()->environment) {
                return '';
            }

            $commentTag = '//';
            $callback = str_replace("\n", "\n//", $callback);
        }

        return $commentTag . $this->getParentId() . '.' . $this->action . '("' . $this->event . '", ' . $callback . ');';
    }
}
