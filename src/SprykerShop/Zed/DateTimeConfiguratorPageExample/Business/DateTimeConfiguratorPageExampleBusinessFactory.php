<?php

/**
 * MIT License
 * For full license information, please view the LICENSE file that was distributed with this source code.
 */

namespace SprykerShop\Zed\DateTimeConfiguratorPageExample\Business;

use Spryker\Zed\Kernel\Business\AbstractBusinessFactory;
use SprykerShop\Zed\DateTimeConfiguratorPageExample\Business\Builder\FrontendBuilder;
use SprykerShop\Zed\DateTimeConfiguratorPageExample\Business\Builder\FrontendBuilderInterface;
use SprykerShop\Zed\DateTimeConfiguratorPageExample\Business\Reader\ProductConcreteAvailabilityReader;
use SprykerShop\Zed\DateTimeConfiguratorPageExample\Business\Reader\ProductConcreteAvailabilityReaderInterface;
use SprykerShop\Zed\DateTimeConfiguratorPageExample\DateTimeConfiguratorPageExampleDependencyProvider;
use SprykerShop\Zed\DateTimeConfiguratorPageExample\Dependency\Facade\DateTimeConfiguratorPageExampleToAvailabilityFacadeInterface;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @method \SprykerShop\Zed\DateTimeConfiguratorPageExample\DateTimeConfiguratorPageExampleConfig getConfig()
 */
class DateTimeConfiguratorPageExampleBusinessFactory extends AbstractBusinessFactory
{
    public function createProductConcreteAvailabilityReader(): ProductConcreteAvailabilityReaderInterface
    {
        return new ProductConcreteAvailabilityReader($this->getAvailabilityFacade());
    }

    public function createProductConfiguratorFrontendBuilder(): FrontendBuilderInterface
    {
        return new FrontendBuilder($this->getFileSystem(), $this->getConfig());
    }

    public function getAvailabilityFacade(): DateTimeConfiguratorPageExampleToAvailabilityFacadeInterface
    {
        return $this->getProvidedDependency(DateTimeConfiguratorPageExampleDependencyProvider::FACADE_AVAILABILITY);
    }

    public function getFileSystem(): Filesystem
    {
        return $this->getProvidedDependency(DateTimeConfiguratorPageExampleDependencyProvider::SYMFONY_FILE_SYSTEM);
    }
}
