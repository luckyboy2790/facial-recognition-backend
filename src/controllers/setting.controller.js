const SettingModel = require('../models/setting.model');

exports.setSetting = async (req, res) => {
  try {
    console.log(req.body);
    const { country, timezone, timeFormat, rfidClock, timeInComments, ipRestriction } = req.body;

    const { id } = req.params;

    if (id && id !== 'undefined') {
      await SettingModel.findByIdAndUpdate(id, {
        country,
        timezone,
        timeFormat,
        rfidClock,
        timeInComments,
        ipRestriction,
      });
    } else {
      const settingModel = new SettingModel({
        country,
        timezone,
        timeFormat,
        rfidClock,
        timeInComments,
        ipRestriction,
      });

      await settingModel.save();
    }

    res.status(200).json({ message: 'Create successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSetting = async (req, res) => {
  try {
    const settingData = await SettingModel.find({});

    res.status(200).json({ message: 'Fetch data successfully', settingData: settingData[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
