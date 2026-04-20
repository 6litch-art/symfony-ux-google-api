<?php

namespace Google\Builder;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
interface GmEntryInterface
{
    public function __toString(): string;
    public function getCommandLine(): string;
    public function setCommandLine(string $cmdline);
}
