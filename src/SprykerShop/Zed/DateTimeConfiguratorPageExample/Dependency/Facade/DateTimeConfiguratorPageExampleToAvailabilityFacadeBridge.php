<?php

/**
 * MIT License
 * For full license information, please view the LICENSE file that was distributed with this source code.
 */

namespace SprykerShop\Zed\DateTimeConfiguratorPageExample\Dependency\Facade;

use Generated\Shared\Transfer\ProductAvailabilityCriteriaTransfer;
use Generated\Shared\Transfer\ProductConcreteAvailabilityTransfer;
use Generated\Shared\Transfer\StoreTransfer;

class DateTimeConfiguratorPageExampleToAvailabilityFacadeBridge implements DateTimeConfiguratorPageExampleToAvailabilityFacadeInterface
{
    /**
     * @var \Spryker\Zed\Availability\Business\AvailabilityFacadeInterface
     */
    protected $availabilityFacade;

    /**
     * @param \Spryker\Zed\Availability\Business\AvailabilityFacadeInterface $availabilityFacade
     */
    public function __construct($availabilityFacade)
    {
        $this->availabilityFacade = $availabilityFacade;
    }

    public function findOrCreateProductConcreteAvailabilityBySkuForStore(
        string $sku,
        StoreTransfer $storeTransfer,
        ?ProductAvailabilityCriteriaTransfer $productAvailabilityCriteriaTransfer = null
    ): ?ProductConcreteAvailabilityTransfer {
        return $this->availabilityFacade->findOrCreateProductConcreteAvailabilityBySkuForStore(
            $sku,
            $storeTransfer,
            $productAvailabilityCriteriaTransfer,
        );
    }
}
