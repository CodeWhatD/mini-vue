const getSeq = (nums) => {
  const arr = [nums[0]];
  for (let index = 0; index < nums.length; index++) {
    if (nums[index] > arr[arr.length - 1]) {
      arr.push(nums[index]);
    } else {
      for (let j = 0; j < arr.length; j++) {
        if (nums[index] <= arr[j]) {
          arr[j] = nums[index];
          break;
        }
      }
    }
  }
  return arr.length;
};
