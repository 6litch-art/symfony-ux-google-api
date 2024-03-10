<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Google\Twig;

use Google\Builder\GmBuilder;
use Symfony\Component\Config\Definition\Exception\Exception;
use Twig\Environment;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/**
 *
 */
class GmTwigExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('google_maps', [$this, 'render'], ['needs_environment' => true, 'is_safe' => ['html']]),
            new TwigFunction('google_maps_export', [$this, 'render_export'], ['needs_environment' => true, 'is_safe' => ['html']]),
            new TwigFunction('google_maps_suppress', [$this, 'render_suppress'], ['needs_environment' => true, 'is_safe' => ['html']]),
        ];
    }

    /**
     * @param Environment $env
     * @param $id
     * @param array $attributes
     * @return string
     */
    public function render(Environment $env, $id, array $attributes = []): string
    {
        if (!($instance = GmBuilder::getInstance($id))) {
            return "";
        }

        foreach ($attributes as $id => $attr) {
            $instance->addOption($id, $attr);
        }

        return $instance->render();
    }

    /**
     * @param Environment $env
     * @param $id
     * @param array $attributes
     * @return string
     */
    public function render_suppress(Environment $env, $id, array $attributes = []): string
    {
        if (!($instance = GmBuilder::getInstance($id))) {
            return "";
        }

        $contents = $attributes['text'] ?? 'X';
        unset($attributes['text']);

        return $instance->render_suppress($contents, $attributes);
    }

    /**
     * @param Environment $env
     * @param $id
     * @param array $attributes
     * @return string
     */
    public function render_export(Environment $env, $id, array $attributes = []): string
    {
        if (!($instance = GmBuilder::getInstance($id))) {
            return "";
        }

        $contents = $attributes['text'] ?? 'O';
        unset($attributes['text']);

        return $instance->render_export($contents, $attributes);
    }
}
