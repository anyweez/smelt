
function changemaker(amount) {
  let bills = [0, 0, 0, 0];

  bills[0] = Math.floor(amount / 20);
  amount = amount % 20;

  bills[1] = Math.floor(amount / 10);
  amount = amount % 10;

  bills[2] = Math.floor(amount / 5);
  amount = amount % 5;

  bills[3] = amount;

  return bills;
}
