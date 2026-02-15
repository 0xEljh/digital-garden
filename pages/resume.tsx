import { Box, Button, Container, Flex, Text, Link, VStack, Heading } from "@chakra-ui/react";
import { NavBar } from "@/components/common/nav";
import { LuDownload, LuLink2 } from "react-icons/lu";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const ResumePage: NextPageWithLayout = () => {
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Navbar - hidden in print */}
      <Box className="no-print" mt={2}>
        <NavBar />
      </Box>
      {/* Download button - hidden in print */}
      <Box
        position="fixed"
        top={{ base: "auto", md: "4" }}
        bottom={{ base: "4", md: "auto" }}
        right="4"
        zIndex="1000"
        className="no-print"
      >
        <Button
          onClick={handleDownloadPDF}
          colorPalette="gray"
          variant="solid"
          size={{ base: "md", md: "lg" }}
          aria-label="Download PDF"
        >
          <LuDownload />
          <Text hideBelow="md">Download PDF</Text>
        </Button>
      </Box>

      {/* Resume Document */}
      <Container
        maxW="8.5in"
        bg="white"
        color="gray.900"
        p="0.45in"
        mx="auto"
        my={{ base: 0, md: 8 }}
        boxShadow={{ base: "none", md: "lg" }}
        className="resume-document"
        fontFamily="'Georgia', 'Garamond', serif"
        fontSize="11pt"
        lineHeight="1.3"
      >
        {/* Header */}
        <Box textAlign="center" mb="0.2in">
          <Heading
            as="h1"
            fontSize="20pt"
            fontWeight="600"
            letterSpacing="0.02em"
            mb="0.08in"
            fontFamily="inherit"
            color="gray.900"
          >
            Elijah Ng
          </Heading>
          <Text fontSize="10pt" color="gray.700">
            <Link href="mailto:elijah@0xeljh.com" color="gray.700" textDecoration="none">elijah@0xeljh.com</Link>
            <Text as="span" mx="0.15in" color="gray.500">·</Text>
            <Link href="https://github.com/0xEljh" color="gray.700" textDecoration="none">github.com/0xEljh</Link>
            <Text as="span" mx="0.15in" color="gray.500">·</Text>
            <Link href="https://0xeljh.com" color="gray.700" textDecoration="none">0xeljh.com</Link>
            <Text as="span" mx="0.15in" color="gray.500">·</Text>
            Singapore
          </Text>
        </Box>

        {/* Summary */}
        <ResumeSection title="Summary">
          <Text fontSize="10.5pt">
            Machine Learning / Systems Engineer focused on training and inference optimisation.
            Experienced with PyTorch internals and kernel level work as well as upstream problem formulation: turning business needs into production Vision/LLM systems.
            Proven ability to translate research concepts into measurable performance gains.
          </Text>
        </ResumeSection>

        {/* Skills */}
        <ResumeSection title="Skills">
          <VStack align="stretch" gap="0.05in">
            <SkillRow label="Training and Inference Optimisation" skills="PyTorch internals, Triton, torch.compile, quantisation, CUDA (reading), FSDP2, HuggingFace ecosystem (accelerate, transformers, etc.), Unsloth, bitsandbytes, tinygrad" />
            <SkillRow label="Machine Learning" skills="PyTorch, finetuning, LLM/Vision pipelines, RAG, wandb, mlflow" />
            <SkillRow label="Data & Pipelines" skills="Prefect, Pandas, SQL, Pydantic, OpenTelemetry" />
            <SkillRow label="Infrastructure" skills="Docker, Nix, FastAPI, PostgreSQL, GCP, AWS/Cloudflare, Next.js" />
          </VStack>
        </ResumeSection>

        {/* Experience */}
        <ResumeSection title="Experience">
          <ExperienceEntry
            title="Technical Cofounder"
            company="IBVC Inc. (Legal/Real Estate Tech)"
            date="2025–Present"
            bullets={[
              "Designed and deployed a Prefect-based ETL pipeline consolidating 50+ legal/real estate data sources into a unified data lake; processed 3k records/day with idempotent and checkpointed runs, growing qualified leads by 10x YoY.",
              "Implemented OpenTelemetry-based observability with LLM-enriched diagnostics to expedite pipeline debugging",
              "Ship an LLM-based information retrieval and document understanding pipeline to extract validated, structured data from unstructured filings to automate downstream lead qualification",
              "Built a context-aware query-variant generator and results filter for skip-tracing. Improved contact hit-rate by 20x while capping cost to <$1/lead",
            ]}
          />
          <ExperienceEntry
            title="Early Software Engineer"
            company="Pacts (Crypto x Anti-Sybil)"
            date="2024"
            bullets={[
              "Owned app/frontend design and implementation; built on-chain analytics tooling for the airdrop platform"
            ]}
          />
          <ExperienceEntry
            title="Technical Cofounder"
            company="MarinaChain (Crypto x Maritime Sustainability)"
            date="2022"
            bullets={[
              "Processed 1.3TB of raw telemetry data via Dusk to engineer features for a physics-informed maritime CO2 emissions model. Combined geospatial data with parsed vessel engineering specs to achieve explainable estimates",
            ]}
          />
          <ExperienceEntry
            title="Machine Learning Engineer"
            company="MindPointEye (Founded by inventor of ELMs)"
            date="2021"
            bullets={[
              "Improved YOLOX-tiny model mAP from 0.60 to 0.85 through data augmentation (SimCLR), LR scheduling, implementing a HPO pipeline, and optimizer implementation tweaks",
              "Developed quantisation + compilation pipeline for YOLOX ONNX graphs to RKNN (Rockchip NPU)",
              "Initiated and led regional team on semi-supervised image labeling and dataset curation via latent space analysis (using fine-tuned GAN embeddings), saving hundreds of team hours per project"
            ]}
          />
        </ResumeSection>

        {/* Projects */}
        <ResumeSection title="Projects">
          <ProjectEntry
            title="Unsloth Challenge"
            date="2025"
            subtitle="MLPerf Puzzles"
            link="https://github.com/0xEljh/unsloth-ai-feb2025"
            bullets={[
              "Implemented custom Triton kernel for NF4 dequantisation, achieved 25% speedup over Unsloth baseline on T4",
              "Enabled QLoRA fine-tuning with FSDP2 and torch.compile with no graph breaks",
              "Implemented a memory-efficient backprop (inspired by cut-cross-entropy) that is compatible with GRPO"
            ]}
          />
          <ProjectEntry
            title="vamptutor.com"
            subtitle="Magic: The Gathering vector-based card search"
            date="2025"
            link="https://vamptutor.com"
            bullets={[
              "Fine-tuned Qwen3-Embedding-4B via 4-bit QLoRA (MultipleNegativesRankingLoss) on a generated contrastive dataset spanning 700+ mechanics; deployed via llama.cpp in the embedding pipeline of the semantic search app",
              "Built a curated challenge-set benchmark with hard negatives and nDCG@k/MRR reports to guide iteration",

            ]}
          />

          <ProjectEntry
            title="Dreambooth Optimization"
            date="2023"
            bullets={[
              "Reduced peak VRAM by 50% for Stable Diffusion fine-tuning through quantization and attention chunking. Turned client profitable by fitting training on 3080 instances from 3090s"
            ]}
          />
          <ProjectEntry
            title="ETH Tokyo 2023"
            subtitle="Winner: Best Data Dashboard (3K USD)"
            bullets={[
              "Doubled down on analysis over visuals: shipped a functional Jupyter Notebook with aggregated analytics for 1inch Fusion resolver on-chain activity, execution profits, and gas spend"
            ]}
          />
          <ProjectEntry
            title="Liquid Crypto Index Fund"
            subtitle="Empire Group (HK fund)"
            date="2023"
            bullets={[
              "Curated a dataset of 2,000+ tokens from 2013–2023 across venues; developed backtests for systematic index fund strategies with modelled and simulated execution conditions (slippage, liquidity, etc.)"
            ]}
          />
          <Box mb="0.12in">
            <Text fontWeight="600" fontSize="11pt">Open Source</Text>
            <Box
              as="ul"
              pl="0.15in"
              mt="0.03in"
              fontSize="10.5pt"
              listStyleType="disc"
              listStylePosition="outside"
            >
              <Box as="li" mb="0.02in">Contributed bug fixes to PyTorch Lightning and bt (backtrader)</Box>
              <Box as="li" mb="0.02in">Classic SGD: Reverted PyTorch SGD to original Sutskever formula for separable LR/momentum behavior</Box>
              <Box as="li" mb="0.02in">Dotfiles: collection of configs and scripts for AI-tools (OpenCode, Claude Code), NixOS, productivity tracking, etc.</Box>
            </Box>
          </Box>
        </ResumeSection>

        {/* Education */}
        <ResumeSection title="Education">
          <Flex justify="space-between" align="baseline">
            <Box>
              <Text as="span" fontWeight="600" fontSize="11pt">National University of Singapore</Text>
            </Box>
            <Text fontSize="10pt" color="gray.600" whiteSpace="nowrap">2017–2021</Text>
          </Flex>
          <Text fontSize="10.5pt" mt="0.03in">
            BEng, Engineering Science. Minor in Computer Science.
          </Text>
          <Text fontSize="10.5pt">
            Specializations: Computational Engineering, Biomedical Engineering
          </Text>
          <Text fontSize="10.5pt">
            Honors with Distinction; A- median grade | 5 postgraduate modules
          </Text>
          <Text fontSize="10.5pt">
            Final Year Project: Self-Organising Neural Networks
          </Text>
          <Text fontSize="10.5pt" mt="0.03in">
            Internships: A*STAR (post-quantum crypto for ML) and DSO National Laboratories (opto-acoustic FEM solver)
          </Text>
        </ResumeSection>

        {/* Technical Writing */}
        <ResumeSection title="Writing">
          <Box
            as="ul"
            pl="0.15in"
            fontSize="10.5pt"
            listStyleType="disc"
            listStylePosition="outside"
          >
            <Box as="li" mb="0.02in">
              <Link href="/posts/cut-cross-entropy" color="gray.900" textDecoration="none">
                Saving VRAM with Apple&apos;s Cut Cross Entropy
                <InlineLinkIcon />
              </Link>
              <Text as="span" color="gray.600"> — Triton kernel breakdown</Text>
            </Box>
            <Box as="li" mb="0.02in">
              <Link href="/posts/cross-entropy" color="gray.900" textDecoration="none">
                Derivation: Cross-Entropy
                <InlineLinkIcon />
              </Link>
              <Text as="span" color="gray.600"> — First principles derivation</Text>
            </Box>
            <Box as="li" mb="0.02in">
              <Link href="/posts/classic-sgd" color="gray.900" textDecoration="none">
                LR Scheduling and SGD
                <InlineLinkIcon />
              </Link>
              <Text as="span" color="gray.600"> — PyTorch SGD internals</Text>
            </Box>
          </Box>
        </ResumeSection>
      </Container>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .resume-document {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
          
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          a {
            text-decoration: none !important;
          }
        }
      `}</style>
    </>
  );
};

// Custom layout to remove default site layout for clean print
ResumePage.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default ResumePage;

// Helper Components

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box as="section" mb="0.18in">
      <Heading
        as="h2"
        fontSize="11pt"
        fontWeight="600"
        textTransform="uppercase"
        letterSpacing="0.08em"
        borderBottom="1px solid"
        borderColor="gray.900"
        pb="0.04in"
        mb="0.08in"
        fontFamily="inherit"
        color="gray.900"
      >
        {title}
      </Heading>
      {children}
    </Box>
  );
}

function SkillRow({ label, skills }: { label: string; skills: string }) {
  return (
    <Text fontSize="10.5pt">
      <Text as="span" fontWeight="600">{label}:</Text> {skills}
    </Text>
  );
}

function ExperienceEntry({
  title,
  company,
  date,
  bullets,
}: {
  title: string;
  company: string;
  date: string;
  bullets: string[];
}) {
  return (
    <Box mb="0.12in">
      <Flex justify="space-between" align="baseline" mb="0.03in">
        <Box>
          <Text as="span" fontWeight="600" fontSize="11pt">{title}</Text>
          <Text as="span" fontStyle="italic" color="gray.700"> — {company}</Text>
        </Box>
        <Text fontSize="10pt" color="gray.600" whiteSpace="nowrap">{date}</Text>
      </Flex>
      <Box
        as="ul"
        pl="0.15in"
        mt="0.03in"
        fontSize="10.5pt"
        listStyleType="disc"
        listStylePosition="outside"
      >
        {bullets.map((bullet, i) => (
          <Box as="li" key={i} mb="0.02in">{bullet}</Box>
        ))}
      </Box>
    </Box>
  );
}

function ProjectEntry({
  title,
  subtitle,
  date,
  bullets,
  link,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  bullets: string[];
  link?: string;
}) {
  return (
    <Box mb="0.12in">
      <Flex justify="space-between" align="baseline" mb="0.03in">
        <Box>
          {link ? (
            <Link href={link} fontWeight="600" fontSize="11pt" color="gray.900" textDecoration="none">
              {title}
              <InlineLinkIcon />
            </Link>
          ) : (
            <Text as="span" fontWeight="600" fontSize="11pt">{title}</Text>
          )}
          {subtitle && <Text as="span" fontStyle="italic" color="gray.700"> — {subtitle}</Text>}
        </Box>
        {date && <Text fontSize="10pt" color="gray.600" whiteSpace="nowrap">{date}</Text>}
      </Flex>
      <Box
        as="ul"
        pl="0.15in"
        mt="0.03in"
        fontSize="10.5pt"
        listStyleType="disc"
        listStylePosition="outside"
      >
        {bullets.map((bullet, i) => (
          <Box as="li" key={i} mb="0.02in">{bullet}</Box>
        ))}
      </Box>
    </Box>
  );
}

function InlineLinkIcon() {
  return (
    <Box
      as="span"
      ml="0.01in"
      display="inline-flex"
      alignItems="center"
      color="gray.600"
      aria-hidden="true"
    >
      <LuLink2 size="0.85em" />
    </Box>
  );
}
