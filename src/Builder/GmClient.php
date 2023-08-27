<?php

namespace Google\Builder;

use Psr\Cache\InvalidArgumentException;
use Symfony\Component\Config\Definition\Exception\Exception;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 *
 */
abstract class GmClient extends GmObject implements GmClientInterface
{
    /**
     * HTTP Client Interface.
     *
     * @var HttpClientInterface|null
     */
    private ?HttpClientInterface $client = null;

    protected mixed $mapMode;

    /**
     * @param HttpClientInterface|null $client
     * @param $opts
     */
    public function __construct(?HttpClientInterface $client, $opts = [])
    {
        parent::__construct($opts);
        if (!$client && !GmBuilder::isReady()) {
            throw new Exception('Missing HttpClientInterface parameter and GmBuilder not initialized');
        }

        $this->client = $client;
    }

    /**
     * Base baseUrl including "http://" protocol information.
     */
    protected string $baseUrl = '';

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    /**
     * @param $baseUrl
     * @return $this
     */
    /**
     * @param $baseUrl
     * @return $this
     */
    public function setBaseUrl($baseUrl): self
    {
        $this->baseUrl = $baseUrl;

        return $this;
    }

    /**
     * Google Map Output Format, either JSON (recommanded) or XML.
     */
    protected string $outputFormat = self::NoEncoding;

    public function getOutputFormat(): string
    {
        return $this->outputFormat;
    }

    /**
     * @param $outputFormat
     * @return $this
     */
    /**
     * @param $outputFormat
     * @return $this
     */
    public function setOutputFormat($outputFormat = self::NoEncoding): self
    {
        $outputFormat = strtolower($outputFormat);
        $this->outputFormat = match ($outputFormat) {
            self::NoEncoding, self::JsonEncoding, self::XmlEncoding => $outputFormat,
            default => throw new Exception('Unexpected output format. It must be either empty, JSON (recommended) or XML'),
        };

        // Map mode is empty when output format is set
        $this->mapMode = '';

        return $this;
    }

    public function getParameters(): mixed
    {
        return $this->getOpts(self::JsonEncoding);
    }

    public function getRequest(string $baseUrl = '', array $opts = []): string
    {
        if (empty($baseUrl)) {
            $baseUrl = $this->baseUrl;
        }
        if (empty($baseUrl)) {
            throw new Exception('No URL defined.');
        }

        $opts = array_filter($opts, static function ($var) {
            return null !== $var;
        });
        $opts = array_merge($this->getOpts(), $opts);

        $parameters = 'key=' . $this->key;
        foreach ($opts as $name => $value) {
            if (!$value) {
                continue;
            }

            if (class_exists($value) && method_exists($value, 'toUrlValue')) {
                $parameters .= '&' . $name . '=' . $value->toUrlValue();
            } else {
                $parameters .= '&' . $name . '=' . $value;
            }
        }

        return rtrim($baseUrl, '/') . ($this->outputFormat ? '/' . $this->outputFormat : '') . '?' . $parameters;
    }

    private const EnableCache = true;

    /**
     * @param string $baseUrl
     * @param array $opts
     * @param int $expiration
     * @return array|mixed|string
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     * @throws InvalidArgumentException
     */
    public function send(string $baseUrl = '', array $opts = [], int $expiration = 30 * 86400)
    {
        if (!$this->client) {
            return ['status' => GmBuilder::STATUS_NOCLIENT];
        }

        $request = $this->getRequest($baseUrl, $opts);
        $request = $this->signUrl($request);

        if ('cli' == php_sapi_name()) {
            
            $response = $this->getResponse($request);

        } else {

            try {
                $response = GmBuilder::getInstance()->cache->get(
                    
                    md5($request),

                    function (ItemInterface $item) use ($request, $expiration) {
                        $content = $this->getResponse($request);
                        if (GmBuilder::STATUS_OK == $content['status']) {
                            $item->expiresAfter((self::EnableCache) ? $expiration : 0);
                        }

                        return $content;
                    }
                );
            } catch (Exception $e)
            {
                return ['status' => GmBuilder::STATUS_BAD];
            }
        }

        return $response;
    }

    /**
     * @param $request
     * @return array
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function getResponse($request): array
    {
        if (!($response = $this->client->request('GET', $request))) {
            throw new Exception('Empty response received from: "' . $request . '"');
        }

        if (($statusCode = $response->getStatusCode()) != 200) {
            throw new Exception('Unexpected status code ' . $statusCode . " returned from: \"$request\"");
        }

        if (self::NoEncoding != $this->getOutputFormat()) {
            $contentType = explode('; ', $response->getHeaders()['content-type'][0])[0];
            $expectedContentType = 'application/' . $this->getOutputFormat();
            if ($contentType != $expectedContentType) {
                throw new Exception('Unexpected content-type received: "' . $contentType . "\" returned from: \"$request\"");
            }
        }

        // Disable cache if not invalid response
        $responseArray = json_decode($response->getContent(), true);
        $status = $responseArray['status'] ?? GmBuilder::STATUS_OK;
        if ('REQUEST_DENIED' == $status) {
            throw new Exception(($responseArray['error_message'] ?? 'Unknown error') . "\n\nHTTP Request: " . $request);
        }

        // Return result
        return $responseArray ?? ['status' => GmBuilder::STATUS_BAD];
    }

    /**
     * @param $args
     * @return string
     */
    public function render($args = []): string
    {
        $options = $this->parseArgs([
            'id    ' => $this->id,
            'class ' => $this->pop('class') ?? '',
            'style ' => $this->pop('style') ?? '',
            'width ' => $this->pop('width') ?? '',
            'height' => $this->pop('height') ?? '',
        ]);

        if (!$this->cacheExists()) {
            GmBuilder::getInstance()->filesystem->uploadCache($this->getCachePath(), $this->send());
        }

        return '<img ' . $options . " src='" . $this->getCacheUrl() . "'>" . PHP_EOL;
    }

    public function checkUrl(string $url, string $signature = null): bool
    {
        // Remove signature variable
        $urlWithoutSignature = preg_replace('/([?&])signature=[^&]+(&|$)/', '$1', $url);
        $urlWithoutSignature = trim($urlWithoutSignature, '&');

        // Get reference signature
        if (null == $signature) {
            $url = parse_url($url);

            $get = [];
            parse_str($url['query'] ?? '', $get);
            $signature = $get['signature'];

            if (null == $signature) {
                throw new Exception('No signature found.');
            }
        }

        return $this->signUrl($urlWithoutSignature) == $signature;
    }

    // Sign a URL with a given crypto key
    // Note that this URL must be properly URL-encoded
    /**
     * @param $url
     * @param $privateKey
     * @return string
     */
    public function signUrl($url, $privateKey = null)
    {
        return $url . '&signature=' . $this->getSignatureUrl($url, $privateKey);
    }

    /**
     * @param $url
     * @param $privateKey
     * @return array|string|string[]
     */
    public function getSignatureUrl($url, $privateKey = null)
    {
        $parseUrl = parse_url($url);
        $urlPartToSign = $parseUrl['path'] . '?' . $parseUrl['query'];

        return $this->getSignature($urlPartToSign, $privateKey);
    }
}
