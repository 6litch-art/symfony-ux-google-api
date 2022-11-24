<?php

namespace Google\DependencyInjection;

use Google\Service\GaService;
use Symfony\Component\HttpKernel\CacheWarmer\CacheWarmerInterface;

class CacheWarmer implements CacheWarmerInterface
{
    protected $shellVerbosity = 0; 
    public function __construct(GaService $gaService)
    {
        $this->shellVerbosity = getenv("SHELL_VERBOSITY");
        $this->gaService = $gaService;
    }
    public function isOptional():bool { return false; }
    public function warmUp($cacheDir): array
    {
        if($this->shellVerbosity > 0 && php_sapi_name() == "cli") echo " // Warming up cache... Google Analytics Basics".PHP_EOL.PHP_EOL;
        $this->gaService->getBasics();

        return [get_class($this->gaService)];
    }
}
