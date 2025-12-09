import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {

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
      promoChannels: {
        sms: req.body.promotionChanel1 || false,
        email: req.body.promotionChanel2 || false,
      },
    };

    console.log(data)


    const user = new User(data);
    await user.save();

    return res.json({ success: true, user});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Registration failed" });
  }
};
