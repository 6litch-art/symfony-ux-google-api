<?php

namespace Google\Builder;

use Symfony\Component\Config\Definition\Exception\Exception;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

abstract class GmClient extends GmObject implements GmClientInterface
{
    /**
     * HTTP Client Interface.
     *
     * @var HttpClientInterface
     */
    private ?HttpClientInterface $client = null;

    protected mixed $mapMode;

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

        $parameters = 'key='.$this->key;
        foreach ($opts as $name => $value) {
            if (!$value) {
                continue;
            }

            if (class_exists($value) && method_exists($value, 'toUrlValue')) {
                $parameters .= '&'.$name.'='.$value->toUrlValue();
            } else {
                $parameters .= '&'.$name.'='.$value;
            }
        }

        return rtrim($baseUrl, '/').($this->outputFormat ? '/'.$this->outputFormat : '').'?'.$parameters;
    }

    private const EnableCache = true;

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
        }

        return $response;
    }

    public function getResponse($request): array
    {
        if (!($response = $this->client->request('GET', $request))) {
            throw new Exception('Empty response received from: "'.$request.'"');
        }

        if (($statusCode = $response->getStatusCode()) != 200) {
            throw new Exception('Unexpected status code '.$statusCode." returned from: \"$request\"");
        }

        if (self::NoEncoding != $this->getOutputFormat()) {
            $contentType = explode('; ', $response->getHeaders()['content-type'][0])[0];
            $expectedContentType = 'application/'.$this->getOutputFormat();
            if ($contentType != $expectedContentType) {
                throw new Exception('Unexpected content-type received: "'.$contentType."\" returned from: \"$request\"");
            }
        }

        // Disable cache if not invalid response
        $responseArray = json_decode($response->getContent(), true);
        $status = $responseArray['status'] ?? GmBuilder::STATUS_OK;
        if ('REQUEST_DENIED' == $status) {
            throw new Exception(($responseArray['error_message'] ?? 'Unknown error')."\n\nHTTP Request: ".$request);
        }

        // Return result
        return $responseArray ?? ['status' => GmBuilder::STATUS_BAD];
    }

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

        return '<img '.$options." src='".$this->getCacheUrl()."'>".PHP_EOL;
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
    public function signUrl($url, $privateKey = null)
    {
        return $url.'&signature='.$this->getSignatureUrl($url, $privateKey);
    }

    public function getSignatureUrl($url, $privateKey = null)
    {
        $parseUrl = parse_url($url);
        $urlPartToSign = $parseUrl['path'].'?'.$parseUrl['query'];

        return $this->getSignature($urlPartToSign, $privateKey);
    }
}
