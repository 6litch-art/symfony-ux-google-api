<?php

namespace Google\Builder;

/**
 *
 */
class GmEntry extends GmObject implements GmEntryInterface
{
    private string $cmdline;

    public function getCommandLine(): string
    {
        return $this->cmdline;
    }

    public function setCommandLine(string $cmdline)
    {
        $this->cmdline = $cmdline;
    }

    public function __toString(): string
    {
        return $this->getCommandLine();
    }

    public function render(): string
    {
        return '';
    }

    public function __construct(string $cmdline = '')
    {
        parent::__construct();
        $this->cmdline = $cmdline;
    }
}
