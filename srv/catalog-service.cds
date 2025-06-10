using com.logali as logali from '../db/schema';
using com.training as training from '../db/training';

// service CatalogService {

//     entity Products       as projection on logali.materials.Products;
//     entity Suppliers      as projection on logali.sales.Suppliers;
//     entity UnitOfMeasures as projection on logali.materials.UnitOfMeasures;
//     entity DimensionUnit  as projection on logali.materials.DimensionUnits;
//     entity Category       as projection on logali.materials.Categories;
//     entity Currency       as projection on logali.materials.Currencies;
//     entity SalesData      as projection on logali.sales.SalesData;
//     entity Reviews        as projection on logali.materials.ProductReview;
//     entity Months          as projection on logali.sales.Months;
//     entity Order          as projection on logali.sales.Orders;
//     entity OrderItem      as projection on logali.sales.OrderItems;
// }

define service CatalogService {

    entity Products           as
        select from logali.reports.Products {
            ID,
            Name          as ProductName     @mandatory,
            Description                      @mandatory,
            ImageUrl,
            ReleaseDate,
            DiscontinuedDate,
            Price                            @mandatory,
            Height,
            Width,
            Depth,
            Quantity                         @(
                mandatory,
                assert.range: [
                    0.00,
                    20.00
                ]
            ),
            UnitOfMeasure as ToUnitOfMeasure @mandatory,
            Currency      as ToCurrency      @mandatory,
            Category      as ToCategory      @mandatory,
            Category.Name as Category        @readonly,
            DimensionUnit as ToDimensionUnit,
            ToSalesData,
            Supplier,
            Reviews,
            Rating,
            Stock,
            ToStockAvailability
        };

    @readonly
    entity Supplier           as
        select from logali.sales.Suppliers {
            ID,
            Name,
            Email,
            Phone,
            Fax,
            Product as ToProduct,
        };

    entity Reviews            as
        select from logali.materials.ProductReview {
            ID,
            Name,
            Rating,
            Comment,
            createdAt,
            Product as ToProduct,
        };

    @readonly
    entity SalesData          as
        select from logali.sales.SalesData {
            ID,
            DeliveredDate,
            Revenue,
            Currency.ID               as CurrencyKey,
            DeliveryMonth.ID          as DeliveryMonthId,
            DeliveryMonth.Description as DeliveryMonth,
            Product                   as ToProduct,

        };

    @readonly
    entity Stock              as
        select from logali.materials.Stock {
            ID,
            Description,
            Product as ToProduct
        };

    @readonly
    entity VH_Categories      as
        select from logali.materials.Categories {
            ID   as Code,
            Name as Text
        };

    @readonly
    entity VH_Currencies      as
        select from logali.materials.Currencies {
            ID          as Code,
            Description as Text
        };

    @readonly
    entity VH_UniteOfMeasures as
        select from logali.materials.UnitOfMeasures {
            ID          as Code,
            Description as Text
        };

    @readonly
    entity VH_DimensionUnits  as
        select
            ID          as Code,
            Description as Text
        from logali.materials.DimensionUnits;
}

define service MyService {

    entity SuppliersProduct as
        select from logali.materials.Products[Name = 'Monitor']{
            *,
            Name,
            Description,
            Supplier.Address
        }
        where
            Supplier.Address.PostalCode = 90210;

    entity SupliersToSales  as
        select
            Supplier.Email,
            Category.Name,
            ToSalesData.Currency.ID,
            ToSalesData.Currency.Description
        from logali.materials.Products;

    entity EntityInfix      as
        select Supplier[Name = 'Topuria'].Phone from logali.materials.Products
        where
            Products.Name = 'Monitor';

    entity EntityJoin       as
        select Phone from logali.materials.Products
        left join logali.sales.Suppliers as supp
            on(
                supp.ID   = Products.Supplier.ID
            )
            and supp.Name = 'Topuria'
        where
            Products.Name = 'Monitor';

}

define service Reports {
    entity AverageRating as projection on logali.reports.AverageRating;

    entity EntityCasting as
        select
            cast(
                Price as Integer
            )     as Price,
            Price as Price2 : Integer
        from logali.materials.Products;

    entity ExityExists as
        select from logali.materials.Products {
            Name
        } where exists Supplier[Name = 'Topuria']
}
