const express = require('express')
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

const checkAdminRole = async function (userID) {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have admin role' })

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();

        console.log('data saved')
        res.status(200).json({ response: response })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have admin role' })

        const candidateId = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true
        })

        if (!response) {
            return res.status(404).json({ message: 'candidate not found' })
        }
        console.log('candidate data updated')
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error ' })
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have admin role' })

        const candidateId = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateId)

        if (!response) {
            return res.status(404).json({ message: 'candidate not found' })
        }
        console.log('candidate deleted')
        res.status(200).json({message: 'candidate deleted'});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error ' })
    }
})

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'candidate not found' });
        }
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        if (user.isVoted) {
            return res.status(400).json({ message: 'you have already voted' });
        }
        if (user.role == 'admin') {
            return res.status(403).json({ message: 'admin not allowed' });
        }
        candidate.votes.push({ user: userId })
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'vote recorded successfully' });


    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error ' })
    }
})

router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 }); 

    const voteRecord = candidates.map((data) => {
      return {
        party: data.party,
        count: data.voteCount
      };
    });

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.error("Error in vote count route:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;