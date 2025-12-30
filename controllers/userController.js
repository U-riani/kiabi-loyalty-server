import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const smsEnabled =
      req.body.promotionChanel1 === true ||
      req.body.promotionChanel1 === "true";

    const emailEnabled =
      req.body.promotionChanel2 === true ||
      req.body.promotionChanel2 === "true";

    const now = new Date();
    const data = {
      branch: req.body.branch,
      gender: req.body.gender,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address || "",
      zipCode: req.body.zipCode || "",
      city: req.body.city || "",
      country: req.body.country || "",
      email: req.body.email || "",
      cardNumber: req.body.cardNumber,
      phone: req.body.phoneNumber,
      termsAccepted: req.body.termsAccepted,
      promoChannels: {
        sms: {
          enabled: smsEnabled,
          createdAt: smsEnabled ? now : null,
          updatedAt: smsEnabled ? now : null,
        },
        email: {
          enabled: emailEnabled,
          createdAt: emailEnabled ? now : null,
          updatedAt: emailEnabled ? now : null,
        },
      },
    };

    const user = new User(data);
    await user.save();

    return res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update simple fields
    const editableFields = [
      "branch",
      "gender",
      "firstName",
      "lastName",
      "dateOfBirth",
      "address",
      "zipCode",
      "country",
      "city",
      "email",
      "cardNumber",
      "phone",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // -----------------------
    //   UPDATE PROMO CHANNELS
    // -----------------------

    if (req.body.promoChannels) {
      // SMS
      if (req.body.promoChannels.sms?.enabled !== undefined) {
        const newVal = req.body.promoChannels.sms.enabled;
        const sms = user.promoChannels.sms;

        if (sms.enabled !== newVal) {
          sms.updatedAt = now;
          if (newVal && !sms.createdAt) sms.createdAt = now;
        }

        sms.enabled = newVal;
      }

      // EMAIL
      if (req.body.promoChannels.email?.enabled !== undefined) {
        const newVal = req.body.promoChannels.email.enabled;
        const email = user.promoChannels.email;

        if (email.enabled !== newVal) {
          email.updatedAt = now;
          if (newVal && !email.createdAt) email.createdAt = now;
        }

        email.enabled = newVal;
      }
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed", message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to fetch user",
      message: err.message,
    });
  }
};

export const getPaginatedUsers = async (req, res) => {
  try {
    // page=1, limit=20 are defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // how many to skip
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 }) // newest first (optional)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const total = await User.countDocuments();

    return res.json({
      success: true,
      page,
      limit,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to fetch users", message: err.message });
  }
};

export const getUsersByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required (YYYY-MM-DD)",
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const users = await User.find({
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({
      success: true,
      date,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
export const getUsersByUpdateDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required (YYYY-MM-DD)",
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const users = await User.find({
      updatedAt: { $gte: start, $lte: end },
    })
      .sort({ updatedAt: -1 })
      .select("-__v");

    return res.json({
      success: true,
      date,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
