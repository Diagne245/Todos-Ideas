const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/User');
const ItemSchema = require('../models/Item');
const Item = new mongoose.model('Item', ItemSchema, 'users');
const { ObjectId } = require('mongodb');

// get all items
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.query.userId });
    res.status(200).json({ success: true, data: user.mainStore.items });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// Set FocusText-----------
router.put('/', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.query.userId },
      {
        $set: {
          'mainStore.focusText': req.body.focusText,
        },
      },
      { new: true }
    );
    res.status(200).json({ success: true, data: user.mainStore.focusText });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// get FocusText ------------
router.get('/focus', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.query.userId });
    res.status(200).json({ success: true, data: user.mainStore.focusText });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// get single item
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.query.userId,
    });

    const item = mainStore.items.find(
      (item) =>
        JSON.stringify(item._id) === JSON.stringify(new ObjectId(req.params.id))
    );
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.arrayOfItems) {
      // add single item-----------
      if (req.body.text) {
        const item = new Item({
          text: req.body.text,
          category: req.body.category,
        });

        await User.findOneAndUpdate(
          { _id: req.body.userId },
          {
            $push: {
              'mainStore.items': item,
            },
          },
          { new: true }
        );

        return res.status(200).json({ success: true, data: item });
      }
    } else if (req.body.arrayOfItems != []) {
      // add Selection of items----------
      const user = await User.findOneAndUpdate(
        { _id: req.body.userId },
        {
          $push: {
            'mainStore.items': {
              $each: req.body.arrayOfItems,
            },
          },
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ success: true, data: user.mainStore.items });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// update item-------------
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const itemToUpdate = user.mainStore.items.find(
      (item) =>
        JSON.stringify(item._id) === JSON.stringify(new ObjectId(req.params.id))
    );
    const itemIndex = user.mainStore.items.indexOf(itemToUpdate);
    itemToUpdate.text = req.body.text;

    // Remove & save the item
    user.mainStore.items.splice(itemIndex, 1);
    user.markModified('mainStore');
    await user.save();

    // Push the new item
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.body.userId },
      {
        $push: {
          'mainStore.items': {
            $each: [itemToUpdate],
            $position: itemIndex,
          },
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ success: true, data: updatedUser.mainStore.items[itemIndex] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// delete an item------------
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const items = user.mainStore.items;
    const itemToDelete = items.find(
      (item) =>
        JSON.stringify(item._id) === JSON.stringify(new ObjectId(req.params.id))
    );
    const itemIndex = items.indexOf(itemToDelete);

    items.splice(itemIndex, 1);
    user.markModified('mainStore');
    await user.save();

    return res.status(200).json({ success: true, data: user.mainStore.items });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// Clear collection
router.delete('/', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.body.userId },
      {
        $set: {
          'mainStore.items': [],
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: user.mainStore.items });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

module.exports = router;