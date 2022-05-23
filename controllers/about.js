exports.renderAboutUs = async (req, res) => {
  res.render('aboutUs.hbs', {
    user: req.user,
  });
};

exports.renderDiabetes = async (req, res) => {
  res.render('aboutDiabetes.hbs', {
    user: req.user,
  });
};
