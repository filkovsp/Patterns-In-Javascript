/**
 * https://www.npmjs.com/package/uuid
 * enter to the folder with this project and install Node UUID package:
 * > npm install uuid
 * then you are ready to use it
 */
const uuidv4 = require('uuid/v4');

/**
 * Price List object Consists of:
 * - Main Price part for the Beverage themselves
 * - additional Condiments to the Beverages
 */
const PriceList = {
    Beverages: {
        "Single Coffee" : 1.40,
        "Double Coffee" : 1.70,
        "Tea": 2.40
    },
    Condiments: {
        "Cream": 0.50,
        "Milk" : 0.20,
        "Sugar": 0.15
    }
};

/**
 * instance of the Order class has list of Beverages in it.
 * it also responcible for applying special discount offer on a given day of the week,
 * which is Thurthday in our case down here.
 * This is a simplified example for the discount logic.
 * In real life we might have 6 cups of Beverages. Then 4 of them must be discounted to 0-price.
 * Current logic will apply discount for only 2 of them.
 */
class Order {
    constructor() {
        this.id = uuidv4();
        this.date = new Date();
        this.beverages = new Array();
    }

    addbeverage(beverage) {
        if (this.date.getDay() == 4 && this.beverages.length > 0 && this.beverages.length < 3) {
            beverage.applyDiscount(1);
        }
        this.beverages.push(beverage);
    }

    removebeverage(beverage) {
        this.beverages.pop(beverage);
    }

    getTotalAmount() {
        var amount = 0;
        this.beverages.forEach(beverage => amount += beverage.getPrice());
        // we round up our amount to the 2nd decimal point:
        return Math.round(amount * 100) / 100
    }
}

/**
 * instance of a Beverage class can only be instanciated with the one of the types listed in
 * "Beverages" part of the pricelist. Otherwise we raise an Exception.
 * We "remember" the initial beverage's type and do not accebpt its changing. E.g: if coffee needs to be changed to
 * a Tea it must be deleted and then new item "Tea" added into the Order.
 * Beverage class represents Decorator pattern here.
 * Whenever a new condiment is added to the beverage we push it into "condiments" array and
 * recalculated beverage's price, applying discount to the new condiment.
 */
class Beverage {
    constructor(type) {
        if (PriceList.Beverages.hasOwnProperty(type)) {
            this.id = uuidv4();
            this.beverageType = type;
            this.beveragePrice = PriceList.Beverages[type];
            this.condiments = new Array();
            this.discount = 0;
        } else {
            throw "Not supported beverage Type!";
        }
    }

    /**
     * This returns beverage's current calculated price.
     */
    getPrice() {
        return this.beveragePrice;
    }

    /**
     * If any condiment is being added we recalculate beverage's whole price
     * taking in account the discount factor.
     */
    addCondiment(condiment) {
        if (PriceList.Condiments.hasOwnProperty(condiment)) {
            this.condiments.push(condiment);
            this.beveragePrice += PriceList.Condiments[condiment] * (1 - this.discount);
        } else {
            throw "Not supported condiment!";
        }

    }

    /**
     * If any condiment is being removed we recalculate beverage's whole price
     * taking in account the discount factor.
     */
    removeCondiment(condiment) {
        if (PriceList.Options.hasOwnProperty(condiment)) {
            this.condiments.pop(condiment);

            this.beveragePrice -= PriceList.Options[condiment] * (1 - this.discount);
        } else {
            throw "Not supported condiment!";
        }
    }

    /**
     * If beverage object is created (it might be also Decorated with additional condiments)
     * and then some discount applyied on top of it later
     * we calculate discount to the whole price as: (Base + Condiments) * Discount Factor.
     */
    applyDiscount(discount) {
        this.discount = discount;
        this.beveragePrice *= (1 - discount);
    }

    /**
     * If discount needs to be removed,
     * we recalculate the whole beverage's price based on its time
     * and then clean price for all the condiments added on top of it again:
     */
    removeDiscount() {
        var price = PriceList.beverages[this.beverageType];
        this.condiments.forEach(condiment => price += PriceList.Options[condiment]);
        this.beveragePrice = price;
        this.discount = 0;
    }
}


var beverage1 = new Beverage("Single Coffee");
beverage1.addCondiment("Cream");
beverage1.applyDiscount(0.5);
// beverage1.removeDiscount();

var beverage2 = new Beverage("Tea");
beverage2.addCondiment("Milk");

var order = new Order();
order.addbeverage(beverage1);
order.addbeverage(beverage2);

console.log("Total amount = " + order.getTotalAmount());
