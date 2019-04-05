/**
 * This is sort of "Observer Abstraction", for Observer pattern.
 * to implement this pattern here we only check if every client (our observer)
 * has update() method, so that we could send them update whenever anything changes
 * at Observer's side.
 * 
 * original task is taken from CodeWars kata: "The Supermarket Queue"
 * https://www.codewars.com/kata/57b06f90e298a7b53d000a86
 * 
 */
class Observable {
  constructor() {
    this.observers = new Array();
  }

  addObserver(o) {
    if (typeof o == "object" && typeof o.update == "function") {
      this.observers.push(o);
      return true;
    } else {
      throw new Error("observer must implement update() method!");
    }
  }

  removeObserver(o) {
    if (this.observers.indexOf(o) > -1) {
      this.observers.pop(o);
    }
  }

  notifyAnObserver(o, subject) {
    o.update(subject);
  }

  notifyAllObservers(subject) {
    this.observers.forEach(function(o) {
      o.update(subject);
    });
  }
}

/**
 * Class Till
 * This class represents a till in a Shop.
 * this class extends Observable class, so that we could register our Shop's class as the observer
 * and send updates to Shop when necessary.
 * Till's constuctor receives Shop's object as reference to its Observer.
 * At the same time Till is Observer for Shop and receive updates from Shop about "time" passing by,
 * sort of "every minute signal"
 */
class Till extends Observable {
  constructor(store) {
    super();
    this.addObserver(store);
    this.servingTime = 0;
  }

  /**
   * Whenever we receive an update from Shop, that means 1 minute (whatever time unit) has passed.
   * so we decrement our own servingTime counter for the current customer.
   * Customer servingTime is provided to us by the Shop's manager, based on customers array data.
   * @param {Shop} subject
   */
  update(subject) {
    if (this.servingTime > 0) {
      this.servingTime--;
    }

    /**
     * when servingTime for the current customer comes to 0 that means we are done with it here
     * and now ready to get another customer from the Shop's manager.
     */
    if (this.servingTime == 0) {
      this.notifyAnObserver(subject, this);
    }
  }

  /**
   * New customer for the till is just representation of the time needed to server that customer.
   * so, whenever we receive it from the Shop's manager we set it to internal variable.
   * @param {integer} servingTime
   */
  newCustomer(servingTime) {
    if (this.servingTime == 0) {
      this.servingTime = servingTime;
      return true;
    } else {
      return false;
    }
  }
}

/**
 * Class Store
 * this class represents Shop itself
 * it extends Observable and also itself is Observer for all the tills in it.
 * it sends updates to all registered Tills every iteration (time unit), let's say a "minute".
 * it manages queues of customers in the Shop directing them to the next available till.
 */
class Store extends Observable {
  constructor(tills) {
    super();
    this.tills = tills;
    this.customers = 0;

    for (var i = 0; i < tills; i++) {
      this.addObserver(new Till(this));
    }
  }

  /**
   * We are subscribed for events from Till objects.
   * Whenever Till gets free it sends us update, so that we knew
   * the till is available for the next customer and we can direct one
   * if there are any other customrers in a queue
   * @param {Till} subject
   */
  update(subject) {
    /**
     * if there are still some customers waiting to be served
     * we will send them to the available till
     */
    if (this.customers.length > 0) {
      subject.newCustomer(this.customers.splice(0, 1)[0]);
    }
  }

  /**
   * this is the Entry point to the Shop's working day.
   * we receive the array of customers' servingTimes here.
   * @param {Array} customers
   */
  serveCustomers(customers) {
    if (!Array.isArray(customers)) {
      throw new Error("Array of customers must be provided!");
    } else {
      // this.customers = customers.sort((a, b) => b > a); // DESC
      this.customers = customers;
    }

    /**
     * No customers to serve - 0 time to work, yeeey! (smile)
     */
    if (this.customers.length == 0) {
      return 0;
    } else if (this.tills == 1) {
    /**
     * if in case there is only one single Till open, then total time to serve all the customers would be
     * the sum of serving time for each of them.
     */
      return this.customers.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
    } else if (this.customers.length <= this.tills) {
    /**
     * if number of tills available biger then number of customers,
     * then max time required for serving all customers will be sort of Max(customers)
     */
      return Math.max.apply(null, this.customers);
    } else {
    /**
     * Load all free Tills fith some first customers,
     * and GET TO THE WORK, NOW!!! :)))
     */
      for (var i = 0; i < this.observers.length; i++) {
        this.observers[i].newCustomer(this.customers.splice(0, 1)[0]);
      }
    }

    /**
     * Store administrator might not know how many tills are currently open,
     * he/she still needs to check if all shop assistants are back from changing/smoking rooms and ready for work.
     * but he commands to open all tills that are ready right now.
     */
    var i = 0;
    while (this.observers.filter(observer => observer.servingTime > 0).length > 0) {
      i++;
      this.notifyAllObservers(this);
    }
    return i;
  }
}

/**
 * Main function which calculates total time needed for
 * serving customers.length number of clients and
 * with customers[i] time in mins for each of the client at numer of tills
 * @param {Array} customers
 * @param {Integer} tills
 */
function queueTime(customers, tills) {
  var store = new Store(tills);
  var time = store.serveCustomers(customers);
  console.log(time);
  return time;
}

/**
 * Simple test:
 */
queueTime([], 1); // Expected: 0
queueTime([1, 2, 3, 4], 1); // Expected: 10
queueTime([2, 2, 3, 3, 4, 4], 2); // Expected: 9
queueTime([1, 2, 3, 4, 5], 100); // Expected: 5

/**
 * Harder ones:
 */
queueTime(
    [43,46,4,29,19,30,46,7,33,26,24],
    6
); // Expected: 59

queueTime(
    [7,13,2,2,20,6,17,5,6,4,11,6,10,18,17,17,3,4,10,7,17,2,6,4,11,7,6,16,10,20,13,16,6,7,9,8,9,4,3,1,15,13,5,5,11,10,4,6,4,5,19,16,7,1,18,10,11,11,20,11,15,17,12,6,6,9,5,17,3,1,5,8,9,8,8,14,8,11,8,18,6,12,15,12,1,6,5,15,13,2,14,8,4,14,18,13,18,7,10,16,16,5,16,19,18,4,7,10,9,15,11,11,20,2,2,3,1,12,1,19,11,16,10,12,5,12,19,8,15,16,19,16,9,2,9,10,15,4,19],
    11
); // Expected: 137

queueTime(
    [8,1,9,8,8,19,9,11,8,15,7,17,6,17,20,9,12,15,8,18,9,1,11,4,20,15,8,19,11,9,8,13,13,2,17,17,3,20,5,6,14,19,1,5,15,6,2,7,12,2,5,4,20,11,9,12,8,20,19,19,18,14,16,4,6,9,20,6,2,3,4,6,17,14,18,14,19,12,10,12,16,18,20,18,20,1,5,3,18,1,19,6,13,20,5,8,19,1,9,20,2,10,11,7,3,11,8,15,2,8,20,16,18,2,13,20,4,2,9,11,18,12,12,2,17,15,2,6],
    18
); // Expected: 85

queueTime(
    [4,9,17,1,9,14,9,13,10,3,3,4,3,5,20,4,9,3,4,16,19,16,8,5,15,14,17,16,18,9,13,12,20,3,11,13,10,5,4,13,4,1,15,12,10,8,10,11,20,3,11,11,13,1,5,7,1,3,3,13,9,19,8,16,16,19,12,1,5,1,15,12,17,15,20,5,10,13,19,3,12,2,10,8,5,8,3,4,5,20,10,2,11,7,1,9,2,1,16,9,2,9,10,3,13,7,15,14,18,10,12],
    20
); // Expected: 62

queueTime(
    [20,4,6,12,3,11,14,18,4,3,6,10,5,14,18,3,16,2,11,12,17,14,3,4,18,8,1,6,15,9,3,7,11,8,16,15,5,6,11,14,11,16,1,17,4,15,16,2,13,18], 
    11
); // Expected: 54
